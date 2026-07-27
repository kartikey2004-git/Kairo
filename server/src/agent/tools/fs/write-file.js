import { tool } from "ai";
import { z } from "zod/v4";
import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveWorkspacePath } from "../../sandbox/paths.js";

export const writeFileTool = tool({
  description: "Write (create or overwrite) a UTF-8 text file within the current workspace.",
  inputSchema: z.object({
    path: z.string().describe("Path relative to the workspace root"),
    content: z.string(),
  }),
  execute: async ({ path: relPath, content }, { experimental_context }) => {
    const { workspaceRoot } = experimental_context;
    const resolved = await resolveWorkspacePath(workspaceRoot, relPath);
    await fs.mkdir(path.dirname(resolved), { recursive: true });
    await fs.writeFile(resolved, content, "utf8");
    return { path: relPath, bytesWritten: Buffer.byteLength(content, "utf8") };
  },
});
