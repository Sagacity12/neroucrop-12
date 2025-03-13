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
            required: true,
        },
        content: {
            type: String,
            required: true, // Content of the notification
        },
        isRead: {
            type: Boolean,
            default: false, //Indicates if the notification has been read 
        },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);