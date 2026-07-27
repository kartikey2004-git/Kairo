import { spawn } from "node:child_process";
import {
  ALLOWED_COMMANDS,
  SANDBOX_TIMEOUT_MS,
  MAX_OUTPUT_BYTES,
  MAX_CONCURRENT_EXECUTIONS_PER_USER,
} from "../../config/sandbox.config.js";
import { resolveWorkspacePath } from "./paths.js";
import { SandboxViolationError } from "./errors.js";

const activeExecutionsByUser = new Map(); // userId -> count

function acquireSlot(userId) {
  const current = activeExecutionsByUser.get(userId) ?? 0;
  if (current >= MAX_CONCURRENT_EXECUTIONS_PER_USER) {
    throw new SandboxViolationError(
      `Too many concurrent commands for user (limit ${MAX_CONCURRENT_EXECUTIONS_PER_USER})`
    );
  }
  activeExecutionsByUser.set(userId, current + 1);
}

function releaseSlot(userId) {
  const current = activeExecutionsByUser.get(userId) ?? 1;
  activeExecutionsByUser.set(userId, Math.max(0, current - 1));
}

/**
 * Runs an allowlisted command inside `workspaceRoot`, confined, timed out, and killed on overflow.
 * Never pass a shell string here — `command` must be a bare binary name, `args` a plain array.
 */
export async function runSandboxed({ command, args = [], cwd, workspaceRoot, userId }) {
  if (!ALLOWED_COMMANDS.has(command)) {
    throw new SandboxViolationError(`Command not allowlisted: ${command}`);
  }

  const resolvedCwd = await resolveWorkspacePath(workspaceRoot, cwd ?? ".");

  acquireSlot(userId);

  try {
    return await new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        cwd: resolvedCwd,
        timeout: SANDBOX_TIMEOUT_MS,
        killSignal: "SIGKILL",
        // Deliberately not `env: process.env` — child gets PATH only, no inherited secrets
        // (API keys, DATABASE_URL, etc. never reach a spawned process).
        env: { PATH: process.env.PATH },
        shell: false, // no shell interpolation surface, ever
      });

      let stdout = "";
      let stderr = "";
      let killedForOverflow = false;

      const guardOverflow = (buf, into) => {
        if (into.length + buf.length > MAX_OUTPUT_BYTES) {
          killedForOverflow = true;
          proc.kill("SIGKILL");
          return into.slice(0, MAX_OUTPUT_BYTES);
        }
        return into + buf;
      };

      proc.stdout.on("data", (d) => (stdout = guardOverflow(d.toString(), stdout)));
      proc.stderr.on("data", (d) => (stderr = guardOverflow(d.toString(), stderr)));

      proc.on("error", reject);
      proc.on("close", (code, signal) => {
        resolve({
          code,
          signal,
          stdout,
          stderr,
          truncated: killedForOverflow,
          timedOut: signal === "SIGTERM" || signal === "SIGKILL",
        });
      });
    });
  } finally {
    releaseSlot(userId);
  }
}
