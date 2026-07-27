import { tool } from "ai";
import { z } from "zod/v4";
import { runSandboxed } from "../../sandbox/executor.js";

export const gitDiffTool = tool({
  description: "Show the current git diff (optionally scoped to a path) in the workspace.",
  inputSchema: z.object({
    path: z.string().optional().describe("Optional pathspec to scope the diff"),
    staged: z.boolean().default(false),
  }),
  execute: async ({ path: scopedPath, staged }, { experimental_context }) => {
    const { workspaceRoot, userId } = experimental_context;
    const args = ["diff", ...(staged ? ["--staged"] : []), ...(scopedPath ? ["--", scopedPath] : [])];
    return runSandboxed({ command: "git", args, workspaceRoot, userId });
  },
});

export const gitCommitTool = tool({
  description: "Stage all changes and commit them with the given message.",
  inputSchema: z.object({
    message: z.string().min(1),
  }),
  execute: async ({ message }, { experimental_context }) => {
    const { workspaceRoot, userId } = experimental_context;
    const add = await runSandboxed({ command: "git", args: ["add", "-A"], workspaceRoot, userId });
    if (add.code !== 0) return { ok: false, step: "add", ...add };

    const commit = await runSandboxed({
      command: "git",
      args: ["commit", "-m", message],
      workspaceRoot,
      userId,
    });
    return { ok: commit.code === 0, step: "commit", ...commit };
  },
});
