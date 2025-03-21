import Joi from "joi";
import createHttpError from "http-errors";

/**
 * Joi schema for validating product data
 */
const productSchema = Joi.object({
    name: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.base': `"name" should be a text string`,
            'string.empty': `"name" cannot be empty`,
            'string.min': `"name" should have at least 3 characters`,
            'string.max': `"name" should not exceed 100 characters`,
            'any.required': `"name" is required`
        }),
    
    description: Joi.string()
        .required()
        .min(10)
        .max(1000)
        .messages({
            'string.base': `"description" should be a text string`,
            'string.empty': `"description" cannot be empty`,
            'string.min': `"description" should have at least 10 characters`,
            'string.max': `"description" should not exceed 1000 characters`,
            'any.required': `"description" is required`
        }),
        
    price: Joi.number()
        .required()
        .positive()
        .messages({
            'number.base': `"price" should be a number`,
            'number.positive': `"price" should be positive`,
            'any.required': `"price" is required`
        }),
        
    quantity: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            'number.base': `"quantity" should be a number`,
            'number.integer': `"quantity" should be an integer`,
            'number.min': `"quantity" should be at least 1`,
            'any.required': `"quantity" is required`
        }),
        
    category: Joi.string()
        .required()
        .messages({
            'string.base': `"category" should be a text string`,
            'any.required': `"category" is required`
        }),
        
    images: Joi.array()
        .items(Joi.string())
        .min(1)
        .messages({
            'array.base': `"images" should be an array`,
            'array.min': `At least one image is required`
        }),
        
    location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).messages({
        'object.base': `"location" should be an object with coordinates`,
    }),
    
    deliveryOptions: Joi.array()
        .items(Joi.string().valid('pickup', 'delivery', 'shipping'))
        .min(1)
        .messages({
            'array.base': `"deliveryOptions" should be an array`,
            'array.min': `At least one delivery option is required`
        }),
        
    deliveryFee: Joi.number()
        .min(0)
        .messages({
            'number.base': `"deliveryFee" should be a number`,
            'number.min': `"deliveryFee" should be at least 0`
        }),
        
    sellerId: Joi.string()
        .required()
        .messages({
            'string.base': `"sellerId" should be a string`,
            'any.required': `"sellerId" is required`
        }),
        
    status: Joi.string()
        .valid('active', 'inactive', 'sold-out')
        .default('active')
        .messages({
            'string.base': `"status" should be a string`,
            'any.only': `"status" must be one of the valid statuses`
        })
});

/**
 * Joi schema for validating order data
 */
const orderSchema = Joi.object({
    buyerId: Joi.string()
        .required()
        .messages({
            'string.base': `"buyerId" should be a string`,
            'any.required': `"buyerId" is required`
        }),
        
    sellerId: Joi.string()
        .required()
        .messages({
            'string.base': `"sellerId" should be a string`,
            'any.required': `"sellerId" is required`
        }),
        
    products: Joi.array()
        .items(Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required(),
            price: Joi.number().positive().required()
        }))
        .min(1)
        .required()
        .messages({
            'array.base': `"products" should be an array`,
            'array.min': `At least one product is required`,
            'any.required': `"products" is required`
        }),
        
    totalAmount: Joi.number()
        .positive()
        .required()
        .messages({
            'number.base': `"totalAmount" should be a number`,
            'number.positive': `"totalAmount" should be positive`,
            'any.required': `"totalAmount" is required`
        }),
        
    deliveryAddress: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        postalCode: Joi.string(),
        coordinates: Joi.array().items(Joi.number()).length(2)
    }).required()
    .messages({
        'object.base': `"deliveryAddress" should be an object`,
        'any.required': `"deliveryAddress" is required`
    }),
    
    deliveryMethod: Joi.string()
        .valid('pickup', 'delivery', 'shipping')
        .required()
        .messages({
            'string.base': `"deliveryMethod" should be a string`,
            'any.only': `"deliveryMethod" must be one of the valid methods`,
            'any.required': `"deliveryMethod" is required`
        }),
        
    deliveryFee: Joi.number()
        .min(0)
        .default(0)
        .messages({
            'number.base': `"deliveryFee" should be a number`,
            'number.min': `"deliveryFee" should be at least 0`
        }),
        
    paymentMethod: Joi.string()
        .valid('momo', 'card', 'bank', 'crypto', 'cash')
        .required()
        .messages({
            'string.base': `"paymentMethod" should be a string`,
            'any.only': `"paymentMethod" must be one of the valid methods`,
            'any.required': `"paymentMethod" is required`
        }),
        
    paymentStatus: Joi.string()
        .valid('pending', 'paid', 'failed')
        .default('pending')
        .messages({
            'string.base': `"paymentStatus" should be a string`,
            'any.only': `"paymentStatus" must be one of the valid statuses`
        }),
        
    orderStatus: Joi.string()
        .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
        .default('pending')
        .messages({
            'string.base': `"orderStatus" should be a string`,
            'any.only': `"orderStatus" must be one of the valid statuses`
        }),
        
    notes: Joi.string()
        .max(500)
        .allow(null, '')
        .messages({
            'string.base': `"notes" should be a string`,
            'string.max': `"notes" should not exceed 500 characters`
        })
});

/**
 * Validate product data using Joi
 * @param {Object} productData - The product data to validate
 * @throws {Error} if validation fails
 */
export const validateProduct = (productData) => {
    const { error, value } = productSchema.validate(productData);
    if (error) {
        throw createHttpError(400, error.details[0].message);
    }
    return value; // Return validated and default-populated data
};

/**
 * Validate order data using Joi
 * @param {Object} orderData - The order data to validate
 * @throws {Error} if validation fails
 */
export const validateOrder = (orderData) => {
    const { error, value } = orderSchema.validate(orderData);
    if (error) {
        throw createHttpError(400, error.details[0].message);
    }
    return value; // Return validated and default-populated data
};

/**
 * Format product response for client
 * @param {Object} product - The product object from database
 * @returns {Object} Formatted product response
 */
export const formatProductResponse = (product) => {
    return {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        category: product.category,
        images: product.images,
        location: product.location,
        deliveryOptions: product.deliveryOptions,
        deliveryFee: product.deliveryFee,
        sellerId: product.sellerId,
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
    };
};

/**
 * Format order response for client
 * @param {Object} order - The order object from database
 * @returns {Object} Formatted order response
 */
export const formatOrderResponse = (order) => {
    return {
        id: order._id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        products: order.products,
        totalAmount: order.totalAmount,
        deliveryAddress: order.deliveryAddress,
        deliveryMethod: order.deliveryMethod,
        deliveryFee: order.deliveryFee,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
    };
};

/**
 * Calculate distance between two coordinates in kilometers
 * @param {Array} coord1 - First coordinate [longitude, latitude]
 * @param {Array} coord2 - Second coordinate [longitude, latitude]
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    return distance;
};

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
const deg2rad = (deg) => {
    return deg * (Math.PI/180);
};

/**
 * Generate a unique order reference
 * @returns {string} Unique order reference
 */
export const generateOrderReference = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
}; 