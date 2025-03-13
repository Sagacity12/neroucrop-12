import { Server } from "socket.io";
import * as chatService from "../services/chatServices.js";


let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ["*","http://127.0.0.1:5501"], // Specify exact origin
            methods: ["GET", "POST"],
            credentials: true
        },
        
    });

    console.log("Socket.io initialized");

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        // Join a chat room
        socket.on("joinChat", (chatId) => {
            socket.join(chatId);
            console.log(`User ${socket.id} joined chat ${chatId}`);
        });

        // Listen for messages and forward to controller
        socket.on("sendMessage", async (messageData) => {
            try {
                //const { chatId, sender, receiver, content, media } = messageData;
                // Use the service to persist the message
                // const message = await chatService.sendMessage(
                //     chatId,
                //     sender,
                //     receiver,
                //     content,
                //     media
                // );
                // Broadcast to room
                io.to(chatId).emit("receiveMessage", messageData);
                
            } catch (error) {
                socket.emit("error", error.message);
            }
        });

        // Typing indicator (no DB interaction)
        socket.on("typing", ({ chatId, userId }) => {
            io.to(chatId).emit("typingIndicator", userId);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

export const getIo = () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
};