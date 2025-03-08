import Chat from "../models/chatmodel.js";

// Create a new chat
export const createChat = async (users, groupChat = false) => {
    const chat = new Chat({ users, groupChat });
    await chat.save();
    return chat;
};

// Send a message in a chat
export const sendMessage = async (chatId, sender, receivers, content, media = []) => {
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error("Chat not found");

    const message = {
        sender,
        receivers,
        content,
        media,
    };

    chat.messages.push(message);
    await chat.save();
    return message;
};

// Get all chats for a user
export const getUserChats = async (userId) => {
    const chats = await Chat.find({ users: userId }).populate("users", "name email");
    return chats;
};

// Get messages in a chat
export const getChatMessages = async (chatId) => {
    const chat = await Chat.findById(chatId).populate("messages.sender messages.receiver", "name email");
    if (!chat) throw new Error("Chat not found");
    return chat.messages;
};

// Update message status (delivered or read)
export const updateMessageStatus = async (chatId, messageId, status) => {
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error("Chat not found");

    const message = chat.messages.id(messageId);
    if (!message) throw new Error("Message not found");

    if (status === "delivered") message.delivered = true;
    if (status === "read") message.read = true;

    await chat.save();
    return message;
};

// Handle typing indicators
export const handleTypingIndicator = async (chatId, userId) => {
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error("Chat not found");

    const typingIndicator = {
        user: userId,
    };

    chat.typingIndicators.push(typingIndicator);
    await chat.save();
    return typingIndicator;
};