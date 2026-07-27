export class SandboxViolationError extends Error {
  constructor(message) {
    super(message);
    this.name = "SandboxViolationError";
  }
}
