import { tool } from "ai";
import { z } from "zod/v4";
import { promises as fs } from "node:fs";
import { resolveWorkspacePath } from "../../sandbox/paths.js";

const MAX_READ_BYTES = 100_000;

export const readFileTool = tool({
  description: "Read a UTF-8 text file from within the current workspace.",
  inputSchema: z.object({
    path: z.string().describe("Path relative to the workspace root"),
  }),
  execute: async ({ path: relPath }, { experimental_context }) => {
    const { workspaceRoot } = experimental_context;
    const resolved = await resolveWorkspacePath(workspaceRoot, relPath);
    const content = await fs.readFile(resolved, "utf8");
    return {
      path: relPath,
      content: content.slice(0, MAX_READ_BYTES),
      truncated: content.length > MAX_READ_BYTES,
    };
  },
});
