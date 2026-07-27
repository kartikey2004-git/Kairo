import chalk from "chalk";
import boxen from "boxen";
import { text, isCancel, intro, outro } from "@clack/prompts";
import { ChatService } from "../../service/chat.service.js";
import { getStoredToken } from "../../lib/token.js";

const chatService = new ChatService();
const KAIRO_SERVER_URL = process.env.KAIRO_SERVER_URL || "http://localhost:3005";

async function getAuthedUser() {
  const token = await getStoredToken();

  if (!token?.access_token) {
    throw new Error("Not authenticated. Please run 'kairo login' first.");
  }

  const response = await fetch(`${KAIRO_SERVER_URL}/api/me`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to resolve session (status ${response.status}). Please login again.`
    );
  }

  const session = await response.json();

  if (!session?.user) {
    throw new Error("User not found. Please login again.");
  }

  console.log(chalk.green(`\n✓ Welcome back, ${session.user.name}!\n`));
  return session.user;
}

async function initConversation(userId, conversationId = null) {
  const conversation = await chatService.getOrCreateConversation(
    userId,
    conversationId,
    "agent"
  );

  const conversationInfo = boxen(
    `${chalk.bold("Conversation")}: ${conversation.title}\n` +
      `${chalk.gray("ID:")} ${conversation.id}\n` +
      `${chalk.gray("Mode:")} ${chalk.magenta("Agent (Tool-Using)")}\n` +
      `${chalk.cyan("Server:")} ${KAIRO_SERVER_URL}`,
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: "round",
      borderColor: "magenta",
      title: "🤖 Agent Mode",
      titleAlignment: "center",
    }
  );

  console.log(conversationInfo);

  return conversation;
}

function toolCallBox(call) {
  return boxen(
    `${chalk.cyan("🔧 Tool:")} ${call.toolName}\n${chalk.gray("Args:")} ${JSON.stringify(
      call.args ?? call.input,
      null,
      2
    )}`,
    {
      padding: 1,
      margin: { top: 1 },
      borderStyle: "round",
      borderColor: "cyan",
      title: "🛠️  Tool Call",
    }
  );
}

function toolResultBox(result) {
  const resultStr = JSON.stringify(result.result ?? result.output, null, 2) ?? "";
  return boxen(
    `${chalk.green("✅ Tool:")} ${result.toolName}\n${chalk.gray("Result:")} ${resultStr.slice(
      0,
      500
    )}${resultStr.length > 500 ? "..." : ""}`,
    {
      padding: 1,
      margin: { bottom: 1 },
      borderStyle: "round",
      borderColor: "green",
      title: "📊 Tool Result",
    }
  );
}

/**
 * Streams one agent turn over HTTP/SSE from the Kairo server — the CLI never
 * touches Prisma or the model directly, it only speaks to `/api/agent/*`.
 */
async function streamAgentTurn(
  conversationId,
  message,
  { onText, onToolCall, onToolResult, onDone, onError }
) {
  const token = await getStoredToken();

  const response = await fetch(
    `${KAIRO_SERVER_URL}/api/agent/${conversationId}/message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.access_token}`,
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!response.ok || !response.body) {
    throw new Error(`Agent request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const line = rawEvent.replace(/^data: /, "");
      if (!line) continue;

      const evt = JSON.parse(line);
      if (evt.type === "text") onText?.(evt.chunk);
      else if (evt.type === "tool_call") onToolCall?.(evt.call);
      else if (evt.type === "tool_result") onToolResult?.(evt.result);
      else if (evt.type === "error") onError?.(evt.message);
      else if (evt.type === "done") onDone?.(evt);
    }
  }
}

async function agentLoop(conversation) {
  const helpBox = boxen(
    `${chalk.cyan.bold("What can the agent do?")}\n\n` +
      `${chalk.gray("• Read and write files in your sandboxed workspace")}\n` +
      `${chalk.gray("• Run allowlisted shell commands")}\n` +
      `${chalk.gray("• Inspect git diffs and create commits")}\n\n` +
      `${chalk.yellow.bold("Examples:")}\n` +
      `${chalk.white('• "Read package.json and tell me the version field"')}\n` +
      `${chalk.white('• "Show me the git diff"')}\n\n` +
      `${chalk.gray('Type "exit" to end the session')}`,
    {
      padding: 1,
      margin: { bottom: 1 },
      borderStyle: "round",
      borderColor: "cyan",
      title: "💡 Agent Instructions",
    }
  );

  console.log(helpBox);

  while (true) {
    const userInput = await text({
      message: chalk.magenta("🤖 What would you like the agent to do?"),
      placeholder: "Describe your request...",
      validate(value) {
        if (!value || value.trim().length === 0) {
          return "Message cannot be empty";
        }
      },
    });

    if (isCancel(userInput)) {
      console.log(chalk.yellow("\n👋 Agent session cancelled\n"));
      process.exit(0);
    }

    if (userInput.toLowerCase() === "exit") {
      console.log(chalk.yellow("\n👋 Agent session ended\n"));
      break;
    }

    const userBox = boxen(chalk.white(userInput), {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: "round",
      borderColor: "blue",
      title: "👤 Your Request",
      titleAlignment: "left",
    });

    console.log(userBox);

    let sawText = false;

    try {
      await streamAgentTurn(conversation.id, userInput, {
        onText: (chunk) => {
          if (!sawText) {
            console.log("\n" + chalk.green.bold("🤖 Assistant:"));
            console.log(chalk.gray("─".repeat(60)));
            sawText = true;
          }
          process.stdout.write(chunk);
        },
        onToolCall: (call) => console.log(toolCallBox(call)),
        onToolResult: (result) => console.log(toolResultBox(result)),
        onError: (message) =>
          console.log(chalk.red(`\n❌ Agent error: ${message}\n`)),
        onDone: () => {
          if (sawText) console.log("\n" + chalk.gray("─".repeat(60)) + "\n");
        },
      });
    } catch (error) {
      console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
    }
  }
}

export async function startAgentChat(conversationId = null) {
  try {
    intro(
      boxen(
        chalk.bold.magenta("🤖 Kairo AI - Agent Mode\n\n") +
          chalk.gray("Tool-using agent (sandboxed file + shell access)"),
        {
          padding: 1,
          borderStyle: "double",
          borderColor: "magenta",
        }
      )
    );

    const user = await getAuthedUser();

    const conversation = await initConversation(user.id, conversationId);

    await agentLoop(conversation);

    outro(chalk.green.bold("\n✨ Thanks for using Agent Mode!"));
  } catch (error) {
    const errorBox = boxen(chalk.red(`❌ Error: ${error.message}`), {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "red",
    });
    console.log(errorBox);
    process.exit(1);
  }
}
