import { promises as fs } from "node:fs";
import path from "node:path";
import { SandboxViolationError } from "./errors.js";

/**
 * Resolves `relativePath` against `workspaceRoot` and guarantees the result
 * stays inside it — rejects `..` escapes and symlink escapes.
 */
export async function resolveWorkspacePath(workspaceRoot, relativePath = ".") {
  const candidate = path.resolve(workspaceRoot, relativePath);

  if (path.relative(workspaceRoot, candidate).startsWith("..")) {
    throw new SandboxViolationError(
      `Path escapes workspace root: ${relativePath}`
    );
  }

  // Resolve symlinks for whichever prefix of the path actually exists, then
  // re-check containment — catches "workspace/link-to-etc/passwd".
  let toCheck = candidate;
  while (true) {
    try {
      const real = await fs.realpath(toCheck);
      const suffix = path.relative(toCheck, candidate);
      const realFull = path.resolve(real, suffix);
      if (path.relative(workspaceRoot, realFull).startsWith("..")) {
        throw new SandboxViolationError(
          `Path escapes workspace root via symlink: ${relativePath}`
        );
      }
      break;
    } catch (err) {
      if (err instanceof SandboxViolationError) throw err;
      // ENOENT: path (or a parent) doesn't exist yet (fine for write_file) — walk up one level.
      const parent = path.dirname(toCheck);
      if (parent === toCheck) break; // hit filesystem root, stop
      toCheck = parent;
    }
  }

  return candidate;
}
