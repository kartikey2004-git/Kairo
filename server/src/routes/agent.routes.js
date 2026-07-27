import { Router } from "express";
import { requireSession } from "../middleware/require-session.js";
import { runAgentLoop } from "../agent/loop.js";
import { ChatService } from "../service/chat.service.js";
import { AIService } from "../cli/ai/google-service.js";
import { resolveAgentWorkspaceRoot } from "../config/workspace.config.js";

const router = Router();
const chatService = new ChatService();
const aiService = new AIService();

router.post("/api/agent/:conversationId/message", requireSession, async (req, res) => {
  const { conversationId } = req.params;
  const { message } = req.body ?? {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message_required" });
  }

  // IDOR guard — the conversation must belong to the authenticated user (T5).
  const conversation = await chatService.getOwnedConversation(conversationId, req.user.id);
  if (!conversation) {
    return res.status(404).json({ error: "conversation_not_found" });
  }

  await chatService.addMessage(conversationId, "user", message);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    await runAgentLoop({
      model: aiService.model,
      conversationId,
      userId: req.user.id,
      workspaceRoot: resolveAgentWorkspaceRoot(req.user.id),
      onEvent: (evt) => res.write(`data: ${JSON.stringify(evt)}\n\n`),
    });
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

export default router;
