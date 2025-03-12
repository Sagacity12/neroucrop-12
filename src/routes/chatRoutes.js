import express from "express";
import {
    createChat,
    sendMessage,
    getUserChats,
    getChatMessages,
    updateMessageStatus,
    handleTypingIndicator,
} from "../controllers/chatController.js";

const router = express.Router();

// Chat routes
router.post("/", createChat);
router.post("/messages", sendMessage);
router.get("/user/:userId", getUserChats);
router.get("/:chatId/messages", getChatMessages);
router.put("/:chatId/messages/:messageId", updateMessageStatus);
router.post("/:chatId/typing", handleTypingIndicator);

export default router;