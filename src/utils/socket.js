import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        // Join a chat room
        socket.on("joinChat", (chatId) => {
            socket.join(chatId);
            console.log(`User ${socket.id} joined chat ${chatId}`);
        });

        // Send a message
        socket.on("sendMessage", (message) => {
            io.to(message.chatId).emit("receiveMessage", message);
        });

        // Typing indicator
        socket.on("typing", (data) => {
            io.to(data.chatId).emit("typingIndicator", data.userId);
        });

        socket.on("stoppedTyping", (data) => {
            io.to(data.chatId).emit("stoppedTyping", data.userId);
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

export const getIo = () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
};