import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    // Reference to buyer
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Reference to seller
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Products in the order
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    
    // Order amount and payment details
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'GHS'
    },
    paymentMethod: {
        type: String,
        enum: ['momo', 'card', 'bank', 'cash', 'crypto'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: String,
    
    // Delivery details
    deliveryAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: String,
        country: {
            type: String,
            required: true
        },
        postalCode: String,
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },
    deliveryMethod: {
        type: String,
        enum: ['pickup', 'delivery', 'shipping'],
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    
    // Order status
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    cancellationReason: String,
    
    // Additional information
    notes: String
}, {
    timestamps: true
});

// Create spatial index for delivery location
orderSchema.index({ 'deliveryAddress.coordinates': '2dsphere' });

const Order = mongoose.model('Order', orderSchema);

export default Order; 