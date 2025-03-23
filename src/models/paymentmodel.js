import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        seller: {
            type: mongoose.Schema.ObjectId,
            ref: "User", 
            required: true,
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        currency: {
            type: String,
            enum: ["GHC", "NGN", "USD", "GBP", "EUR", "CRYPTO",],
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        paymentToken: {
            type: String,
            required: true,
        },
        cryptoDetails: {
            cryptoTypes: {
                type: String,
                enum: ["Bitcoin", "Ethereum", "USDT", "BNB"],
                default: null
            },
            cryptoAmount: {
                type: Number,
                default: null,
            },
            tradingType: {
                type: String,
                enum: ["Buy", "Sell", "Trade"],
                default: null
            },
        },
        status: {
            type: String,
            enum: ["Pending", "Completed", "Cancelled"],
            default: "Pending"
        },
    },
    { timestamps: true }
);


export default mongoose.model("order", orderSchema);