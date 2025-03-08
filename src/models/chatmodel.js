import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        users: [{
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,// Users participating in the chat 
        }],
        groupChat: {
            type: Boolean,
            default: false, // Indicates if the  chat is a group chat 
        },
        messages: [{
            sender: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true, // User who sent the message
            },
            receivers: [{  // Change to an array for group chats
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            }],
            content: {
                type: String,
                required: true, // Text content of the message
            },
            media: {
                type: [String], //Array to hold media URLs (images, videos, decuments)
                default: [],
            },
            emojis: [{
                type: String, //Array to hold emojis used in the message
                default: [],
            }],
            delivered: {
                type:Boolean,
                default: false, // Indicates if the message has been delivered 
            },
            read: {
                type: Boolean,
                default: false, //Indicates if the message has been read 
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        createdAt: {
            type: Date,
            default: Date.now,
        },
        cameraEnable: {
            type: Boolean,
            default: false, // Indicates if camera sharing is enable
        },
        audioEnable: {
            type: Boolean,
            default: false, // Indicates if audio sharing is enable 
        },
    },
    { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);