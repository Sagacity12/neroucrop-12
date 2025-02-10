import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        media: {
            type: String,
            default: null,
        },
        likes: {
            type: Number,
            default: 0,
        },
        comments:[{
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
        content: {
            type: String,
            required: true,
        },
        createAt: {
            type: Date,
            default: Date.now,
        },
        }],
        tags: {
            type: [String],
            default: [],
        },
        categories: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);