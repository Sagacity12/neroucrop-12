import {
    createProduct,
    getProductById,
    getProductsBySellerId,
    updateProduct,
    deleteProduct,
    findNearbyProducts,
    searchProducts,
    createOrder,
    getOrderById,
    getOrdersByBuyerId,
    getOrdersBySellerId,
    updateOrderStatus,
    calculateDeliveryFee
} from '../services/marketService.js';
import { formatProductResponse, formatOrderResponse } from '../helpers/markethelper.js';
import logger from '../config/logger.js';
import { sendOrderNotification } from '../services/notificationService.js';

/**
 * Create a new product
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const createNewProduct = async (req, res) => {
    try {
        // Ensure user is a seller
        if (req.user.role !== 'Seller') {
            return res.status(403).json({
                success: false,
                error: 'Only sellers can create products'
            });
        }
        
        // Add seller ID from authenticated request
        const productData = {
            ...req.body,
            sellerId: req.user._id
        };
        
        const product = await createProduct(productData);
        
        res.status(201).json({
            success: true,
            data: formatProductResponse(product)
        });
    } catch (error) {
        logger.error(`Product creation error: ${error.message}`);
        throw error; // Let error middleware handle it
    }
};

/**
 * Get product by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await getProductById(productId);
        
        res.status(200).json({
            success: true,
            data: formatProductResponse(product)
        });
    } catch (error) {
        logger.error(`Get product error: ${error.message}`);
        throw error;
    }
};

/**
 * Get seller's products
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.params.sellerId || req.user._id;
        
        // If requesting other seller's products, no authorization needed
        // If requesting own products, user must be the seller
        if (sellerId === req.user._id.toString() && req.user.role !== 'Seller') {
            return res.status(403).json({
                success: false,
                error: 'User is not a seller'
            });
        }
        
        const products = await getProductsBySellerId(sellerId);
        
        res.status(200).json({
            success: true,
            count: products.length,
            data: products.map(formatProductResponse)
        });
    } catch (error) {
        logger.error(`Get seller products error: ${error.message}`);
        throw error;
    }
};

/**
 * Update product
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const updateProductDetails = async (req, res) => {
    try {
        // Ensure user is a seller
        if (req.user.role !== 'Seller') {
            return res.status(403).json({
                success: false,
                error: 'Only sellers can update products'
            });
        }
        
        const { productId } = req.params;
        const sellerId = req.user._id;
        
        const product = await updateProduct(productId, sellerId, req.body);
        
        res.status(200).json({
            success: true,
            data: formatProductResponse(product)
        });
    } catch (error) {
        logger.error(`Update product error: ${error.message}`);
        throw error;
    }
};

/**
 * Delete product
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const removeProduct = async (req, res) => {
    try {
        // Ensure user is a seller
        if (req.user.role !== 'Seller') {
            return res.status(403).json({
                success: false,
                error: 'Only sellers can delete products'
            });
        }
        
        const { productId } = req.params;
        const sellerId = req.user._id;
        
        const result = await deleteProduct(productId, sellerId);
        
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        logger.error(`Delete product error: ${error.message}`);
        throw error;
    }
};

/**
 * Find products near a location
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getNearbyProducts = async (req, res) => {
    try {
        const { longitude, latitude, distance = 50 } = req.query;
        
        if (!longitude || !latitude) {
            return res.status(400).json({
                success: false,
                error: 'Longitude and latitude are required'
            });
        }
        
        const coordinates = [parseFloat(longitude), parseFloat(latitude)];
        const products = await findNearbyProducts(coordinates, parseFloat(distance));
        
        res.status(200).json({
            success: true,
            count: products.length,
            data: products.map(formatProductResponse)
        });
    } catch (error) {
        logger.error(`Find nearby products error: ${error.message}`);
        throw error;
    }
};

/**
 * Search products
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const searchProductsHandler = async (req, res) => {
    try {
        const { query, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;
        
        const searchParams = {
            query,
            category,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            sort,
            page: parseInt(page),
            limit: parseInt(limit)
        };
        
        const { products, total, totalPages } = await searchProducts(searchParams);
        
        res.status(200).json({
            success: true,
            count: products.length,
            total,
            totalPages,
            currentPage: parseInt(page),
            data: products.map(formatProductResponse)
        });
    } catch (error) {
        logger.error(`Search products error: ${error.message}`);
        throw error;
    }
};

/**
 * Create a new order
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const createNewOrder = async (req, res) => {
    try {
        // Add buyer ID from authenticated request
        const orderData = {
            ...req.body,
            buyerId: req.user._id
        };
        
        const order = await createOrder(orderData);
        
        // After order creation, send notification to seller
        try {
            await sendOrderNotification('new-order', order._id);
        } catch (notificationError) {
            // Log but don't fail the order if notification fails
            logger.error(`Failed to send order notification: ${notificationError.message}`);
        }
        
        res.status(201).json({
            success: true,
            data: formatOrderResponse(order)
        });
    } catch (error) {
        logger.error(`Order creation error: ${error.message}`);
        throw error;
    }
};

/**
 * Get order by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await getOrderById(orderId);
        
        // Check if user is authorized to view this order
        if (order.buyerId.toString() !== req.user._id.toString() && 
            order.sellerId.toString() !== req.user._id.toString() && 
            req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this order'
            });
        }
        
        res.status(200).json({
            success: true,
            data: formatOrderResponse(order)
        });
    } catch (error) {
        logger.error(`Get order error: ${error.message}`);
        throw error;
    }
};

/**
 * Get buyer's orders
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getBuyerOrders = async (req, res) => {
    try {
        const buyerId = req.params.buyerId || req.user._id;
        
        // Check if user is authorized to view these orders
        if (buyerId !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view these orders'
            });
        }
        
        const orders = await getOrdersByBuyerId(buyerId);
        
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders.map(formatOrderResponse)
        });
    } catch (error) {
        logger.error(`Get buyer orders error: ${error.message}`);
        throw error;
    }
};

/**
 * Get seller's orders
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getSellerOrders = async (req, res) => {
    try {
        // Ensure user is a seller
        if (req.user.role !== 'Seller' && req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view seller orders'
            });
        }
        
        const sellerId = req.params.sellerId || req.user._id;
        
        // If admin is requesting another seller's orders, that's allowed
        // If seller is requesting orders, must be their own
        if (req.user.role !== 'Admin' && sellerId !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view these orders'
            });
        }
        
        const orders = await getOrdersBySellerId(sellerId);
        
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders.map(formatOrderResponse)
        });
    } catch (error) {
        logger.error(`Get seller orders error: ${error.message}`);
        throw error;
    }
};

/**
 * Update order status
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const updateOrderStatusHandler = async (req, res) => {
    try {
        // Ensure user is a seller
        if (req.user.role !== 'Seller' && req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update order status'
            });
        }
        
        const { orderId } = req.params;
        const { status } = req.body;
        const sellerId = req.user._id;
        
        const order = await updateOrderStatus(orderId, sellerId, status);
        
        // After order status update, send notification to buyer
        try {
            await sendOrderNotification('order-status-update', order._id);
        } catch (notificationError) {
            // Log but don't fail the update if notification fails
            logger.error(`Failed to send order status notification: ${notificationError.message}`);
        }
        
        // If the order status was changed to "processing", this implies the seller has "approved" the order
        if (status === 'processing') {
            logger.info(`Order ${orderId} has been approved by seller ${sellerId}`);
        }
        
        res.status(200).json({
            success: true,
            data: formatOrderResponse(order)
        });
    } catch (error) {
        logger.error(`Update order status error: ${error.message}`);
        throw error;
    }
};

/**
 * Calculate delivery fee
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const calculateDeliveryFeeHandler = async (req, res) => {
    try {
        const { 
            sellerLongitude, 
            sellerLatitude, 
            buyerLongitude, 
            buyerLatitude, 
            deliveryMethod 
        } = req.body;
        
        if (!sellerLongitude || !sellerLatitude || !buyerLongitude || !buyerLatitude || !deliveryMethod) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }
        
        const sellerCoordinates = [parseFloat(sellerLongitude), parseFloat(sellerLatitude)];
        const buyerCoordinates = [parseFloat(buyerLongitude), parseFloat(buyerLatitude)];
        
        const fee = await calculateDeliveryFee(sellerCoordinates, buyerCoordinates, deliveryMethod);
        
        res.status(200).json({
            success: true,
            data: {
                deliveryFee: fee,
                currency: 'GHS',
                deliveryMethod
            }
        });
    } catch (error) {
        logger.error(`Calculate delivery fee error: ${error.message}`);
        throw error;
    }
}; 