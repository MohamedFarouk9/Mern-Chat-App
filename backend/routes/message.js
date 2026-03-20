import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  addReaction,
  deleteMessage,
  editMessage,
  getConversation,
  getConversations,
  markAsRead,
  removeReaction,
  sendMessage,
} from "../controllers/messageController";
import { validateSendMessage } from "../middleware/validator";

const router = express.Router();

// all routes require auth
router.use(authMiddleware);

//conversation routes
router.get("/conversations", getConversations);
router.get("/conversation/:conversationId", getConversation);

// messages
router.post("/send", validateSendMessage, sendMessage);
router.put("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);
router.put("/:messageId/read", markAsRead);

//reactions
router.post("/:messageId/reaction", addReaction);
router.delete("/:messageId/reaction", removeReaction);

export default router;
