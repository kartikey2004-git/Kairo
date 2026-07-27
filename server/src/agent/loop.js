import { streamText, stepCountIs } from "ai";
import { agentTools } from "./tools/index.js";
import { ChatService } from "../service/chat.service.js";

const chatService = new ChatService();
const MAX_STEPS = 12;

/**
 * Runs the tool-use loop for one user turn: streams text, executes tool calls
 * (via `agentTools`, sandboxed), persists every step, and stops at MAX_STEPS.
 */
export async function runAgentLoop({ model, conversationId, userId, workspaceRoot, onEvent }) {
  const dbMessages = await chatService.getMessages(conversationId);
  const history = chatService.formatMessagesForModel(dbMessages);

  const result = streamText({
    model,
    messages: history,
    tools: agentTools,
    stopWhen: stepCountIs(MAX_STEPS),
    experimental_context: { userId, workspaceRoot },
    onStepFinish: async (step) => {
      for (const call of step.toolCalls ?? []) {
        await chatService.addMessage(conversationId, "tool_call", call);
        onEvent?.({ type: "tool_call", call });
      }
      for (const res of step.toolResults ?? []) {
        await chatService.addMessage(conversationId, "tool_result", res);
        onEvent?.({ type: "tool_result", result: res });
      }
      const toolErrors = (step.content ?? []).filter(
        (part) => part.type === "tool-error"
      );
      for (const err of toolErrors) {
        const errorResult = {
          toolCallId: err.toolCallId,
          toolName: err.toolName,
          input: err.input,
          output: { error: err.error instanceof Error ? err.error.message : String(err.error) },
        };
        await chatService.addMessage(conversationId, "tool_result", errorResult);
        onEvent?.({ type: "tool_result", result: errorResult });
      }
    },
  });

  for await (const chunk of result.textStream) {
    onEvent?.({ type: "text", chunk });
  }

  const final = await result;
  await chatService.addMessage(conversationId, "assistant", final.text);
  onEvent?.({ type: "done", finishReason: final.finishReason, usage: final.usage });

  return final;
}
