import path from "node:path";
import os from "node:os";

const WORKSPACES_ROOT = path.join(os.homedir(), ".kairo", "workspaces");

export function resolveAgentWorkspaceRoot(userId) {
  return path.join(WORKSPACES_ROOT, userId);
}
