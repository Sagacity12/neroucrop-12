import mongoose from "mongoose";

const forumSchema = new mongoose.Schema(
    {
        tittle: {
            type: String,
            required: true, // Tittle of the forum post 
        },
        content: {
            type: String,
            required: true, // Main content of the forum post
        },
        author: {
            type: mongoose.Schema.ObjectId,
            ref: "User", 
            required: true, // User who created the post 
        },
        createdAt: {
            type: Date,
            default: Date.now, //Timestamp for when the post was created
        },
        updatedAt: {
            type: Date, 
            default: Date.now, // Timestamp for when the post was last updated
        },
        comments: [{
            user:{
                type: mongoose.Schema.ObjectId,
                ref:"User",
                required: true, // User who commented on the post 
            },
            content: {
                type: String,
                required: true, // Content of the comment
            },
            createdAt: {
                type: Date,
                default: Date.now, // Timestamp for when the comment was created
            },
        }],
        tags: {
            type: [String], // Array for tags or categories related to the post
            default: [],   
        },
        likes: {
            type: Number,
            default: 0, // Count of likes for the post 
        },
    },
    { timestamps: true }
);

export default mongoose.model("Forum", forumSchema);