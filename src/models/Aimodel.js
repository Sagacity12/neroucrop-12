import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'audio', 'video', 'image',], //Specify type of content 
    },
    data: {
        type: String, // URL or base64 string for the content 
        required: true 
    }
});

const aiInteractionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    messages: [{
        sender: {
            type: String, // user, or bot 
            required: true,
        },
        content: [contentSchema], // Array of content objects
        prompt: {
            type: String, // The prompt sent it to ai
            required: true // Ensure prompt is required
        },
        response: {
            type: String, // The response received from the Ai to the User
            required: true // Ensure response is required 
        },
        createdAt: {
            type: Date,
            default: null // Automatically records the date of the message
        }
    }],
    context: {
        type: String, // optional field to provide context for the conversation 
        default: null
    },
    createAt: {
        type: Date,
        default: Date.now
    },
});


export default mongoose.model('aiInteraction', aiInteractionSchema)
