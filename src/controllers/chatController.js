// import Chat from "../models/Chat.js";
import * as chatService from "../services/chatServices.js";

// Create a new chat
export const createChat = async (req, res) => {
    try {
        const { users, groupChat } = req.body;
        const chat = await chatService.createChat(users, groupChat);
        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send a message in a chat
export const sendMessage = async (req, res) => {
    try {
        const { chatId, sender, receiver, content, media } = req.body;
        const message = await chatService.sendMessage(chatId, sender, receiver, content, media);
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
    try {
        const { userId } = req.params;
        const chats = await chatService.getUserChats(userId);
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get messages in a chat
export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await chatService.getChatMessages(chatId);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update message status (delivered or read)
export const updateMessageStatus = async (req, res) => {
    try {
        const { chatId, messageId, status } = req.body;
        const updatedMessage = await chatService.updateMessageStatus(chatId, messageId, status);
        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Handle typing indicators
export const handleTypingIndicator = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const typingIndicator = await chatService.handleTypingIndicator(chatId, userId);
        res.status(200).json(typingIndicator);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};