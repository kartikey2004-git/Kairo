export const ALLOWED_COMMANDS = new Set([
  "node",
  "npm",
  "npx",
  "git",
  "ls",
  "cat",
  "grep",
]);

export const SANDBOX_TIMEOUT_MS = 15_000;
export const MAX_OUTPUT_BYTES = 200_000;
export const MAX_CONCURRENT_EXECUTIONS_PER_USER = 2;
