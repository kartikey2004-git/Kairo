import { tool } from "ai";
import { z } from "zod/v4";
import { runSandboxed } from "../../sandbox/executor.js";
import { ALLOWED_COMMANDS } from "../../../config/sandbox.config.js";

export const shellExecTool = tool({
  description: `Run an allowlisted shell command in the workspace. Allowlisted commands: ${[
    ...ALLOWED_COMMANDS,
  ].join(", ")}.`,
  inputSchema: z.object({
    command: z.string(),
    args: z.array(z.string()).default([]),
    cwd: z.string().optional(),
  }),
  execute: async ({ command, args, cwd }, { experimental_context }) => {
    const { workspaceRoot, userId } = experimental_context;
    return runSandboxed({ command, args, cwd, workspaceRoot, userId });
  },
});
