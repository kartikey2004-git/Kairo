import prisma from "../lib/db.js";

/**
 * Resolves the session's user from an `Authorization: Bearer <access_token>` header —
 * the same lookup already used (duplicated) across the CLI chat commands, centralized here
 * so every HTTP route enforces it identically.
 */
export async function requireSession(req, res, next) {
  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "missing_bearer_token" });
  }

  const user = await prisma.user.findFirst({
    where: { sessions: { some: { token } } },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return res.status(401).json({ error: "invalid_or_expired_session" });
  }

  req.user = user;
  next();
}
