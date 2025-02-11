import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true, // User to whom the notification is directed
        },
        type: {
            type: String,
            enum: ["message", "purchase", "system"], // Types of notification
            requored: true,
        },
        content: {
            type: String,
            required: true, // Content of the notification
        },
        isRead: {
            type: Boolean,
            default: false, //Indicates if the notification has been read 
        },
        createdAt: {
            type: Date,
            default: Date.now, // Timestamp for when the notificationwas created
        },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);