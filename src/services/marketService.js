import Product from '../models/marketmodel.js';
import Order from '../models/paymentmodel.js';
import User from '../models/usermodel.js';
import { validateProduct, validateOrder, calculateDistance } from '../helpers/markethelper.js';
import createHttpError from 'http-errors';
import logger from '../config/logger.js';

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Created product
 */
export const createProduct = async (productData) => {
    try {
        // Validate product data
        const validatedData = validateProduct(productData);
        
        // Verify seller exists
        const seller = await User.findById(validatedData.sellerId);
        if (!seller) {
            throw createHttpError(404, 'Seller not found');
        }
        
        // Verify seller has role 'Seller'
        if (seller.role !== 'Seller') {
            throw createHttpError(403, 'User is not a seller');
        }
        
        // Create product
        const product = await Product.create(validatedData);
        
        logger.info(`Product created: ${product._id} by seller: ${product.sellerId}`);
        
        return product;
    } catch (error) {
        logger.error(`Error creating product: ${error.message}`);
        throw error;
    }
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product object
 */
export const getProductById = async (productId) => {
    try {
        const product = await Product.findById(productId);
        
        if (!product) {
            throw createHttpError(404, 'Product not found');
        }
        
        return product;
    } catch (error) {
        logger.error(`Error fetching product: ${error.message}`);
        throw error;
    }
};

/**
 * Get products by seller ID
 * @param {string} sellerId - Seller ID
 * @returns {Promise<Array>} Array of product objects
 */
export const getProductsBySellerId = async (sellerId) => {
    try {
        const products = await Product.find({ sellerId }).sort({ createdAt: -1 });
        return products;
    } catch (error) {
        logger.error(`Error fetching seller products: ${error.message}`);
        throw error;
    }
};

/**
 * Update product
 * @param {string} productId - Product ID
 * @param {string} sellerId - Seller ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated product
 */
export const updateProduct = async (productId, sellerId, updateData) => {
    try {
        // Find product
        const product = await Product.findById(productId);
        
        if (!product) {
            throw createHttpError(404, 'Product not found');
        }
        
        // Verify seller owns the product
        if (product.sellerId.toString() !== sellerId) {
            throw createHttpError(403, 'Not authorized to update this product');
        }
        
        // Update product
        Object.keys(updateData).forEach(key => {
            product[key] = updateData[key];
        });
        
        await product.save();
        
        logger.info(`Product ${productId} updated by seller: ${sellerId}`);
        
        return product;
    } catch (error) {
        logger.error(`Error updating product: ${error.message}`);
        throw error;
    }
};

/**
 * Delete product
 * @param {string} productId - Product ID
 * @param {string} sellerId - Seller ID (for authorization)
 * @returns {Promise<Object>} Deletion result
 */
export const deleteProduct = async (productId, sellerId) => {
    try {
        // Find product
        const product = await Product.findById(productId);
        
        if (!product) {
            throw createHttpError(404, 'Product not found');
        }
        
        // Verify seller owns the product
        if (product.sellerId.toString() !== sellerId) {
            throw createHttpError(403, 'Not authorized to delete this product');
        }
        
        // Delete product
        await Product.findByIdAndDelete(productId);
        
        logger.info(`Product ${productId} deleted by seller: ${sellerId}`);
        
        return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
        logger.error(`Error deleting product: ${error.message}`);
        throw error;
    }
};

/**
 * Search products by location and distance
 * @param {Array} coordinates - [longitude, latitude]
 * @param {number} maxDistance - Maximum distance in kilometers
 * @returns {Promise<Array>} Array of nearby products
 */
export const findNearbyProducts = async (coordinates, maxDistance = 50) => {
    try {
        // Find products within the specified distance
        const products = await Product.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: coordinates
                    },
                    $maxDistance: maxDistance * 1000 // Convert km to meters
                }
            },
            status: 'active'
        });
        
        return products;
    } catch (error) {
        logger.error(`Error finding nearby products: ${error.message}`);
        throw error;
    }
};

/**
 * Search products by category, name, or description
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Array>} Array of matching products
 */
export const searchProducts = async (searchParams) => {
    try {
        const { query, category, minPrice, maxPrice, sort = 'createdAt', order = 'desc' } = searchParams;
        
        // Build search criteria
        const searchCriteria = { status: 'active' };
        
        if (query) {
            searchCriteria.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        
        if (category) {
            searchCriteria.category = category;
        }
        
        if (minPrice !== undefined || maxPrice !== undefined) {
            searchCriteria.price = {};
            if (minPrice !== undefined) searchCriteria.price.$gte = minPrice;
            if (maxPrice !== undefined) searchCriteria.price.$lte = maxPrice;
        }
        
        // Build sort options
        const sortOptions = {};
        sortOptions[sort] = order === 'desc' ? -1 : 1;
        
        // Execute search
        const products = await Product.find(searchCriteria)
            .sort(sortOptions)
            .limit(50);
        
        return products;
    } catch (error) {
        logger.error(`Error searching products: ${error.message}`);
        throw error;
    }
};

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order
 */
export const createOrder = async (orderData) => {
    try {
        // Validate order data
        const validatedData = validateOrder(orderData);
        
        // Verify buyer exists
        const buyer = await User.findById(validatedData.buyerId);
        if (!buyer) {
            throw createHttpError(404, 'Buyer not found');
        }
        
        // Verify seller exists
        const seller = await User.findById(validatedData.sellerId);
        if (!seller) {
            throw createHttpError(404, 'Seller not found');
        }
        
        // Verify products exist and have sufficient quantity
        for (const item of validatedData.products) {
            const product = await Product.findById(item.productId);
            
            if (!product) {
                throw createHttpError(404, `Product ${item.productId} not found`);
            }
            
            if (product.quantity < item.quantity) {
                throw createHttpError(400, `Insufficient quantity for product ${product.name}`);
            }
            
            if (product.status !== 'active') {
                throw createHttpError(400, `Product ${product.name} is not available`);
            }
            
            // Verify seller owns the product
            if (product.sellerId.toString() !== validatedData.sellerId) {
                throw createHttpError(400, `Product ${product.name} does not belong to the specified seller`);
            }
        }
        
        // Create order
        const order = await Order.create(validatedData);
        
        // Update product quantities
        for (const item of validatedData.products) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { quantity: -item.quantity }
            });
            
            // If product quantity reaches 0, update status to sold-out
            const updatedProduct = await Product.findById(item.productId);
            if (updatedProduct.quantity <= 0) {
                updatedProduct.status = 'sold-out';
                await updatedProduct.save();
            }
        }
        
        logger.info(`Order created: ${order._id} by buyer: ${order.buyerId} from seller: ${order.sellerId}`);
        
        return order;
    } catch (error) {
        logger.error(`Error creating order: ${error.message}`);
        throw error;
    }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order object
 */
export const getOrderById = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        
        if (!order) {
            throw createHttpError(404, 'Order not found');
        }
        
        return order;
    } catch (error) {
        logger.error(`Error fetching order: ${error.message}`);
        throw error;
    }
};

/**
 * Get orders by buyer ID
 * @param {string} buyerId - Buyer ID
 * @returns {Promise<Array>} Array of order objects
 */
export const getOrdersByBuyerId = async (buyerId) => {
    try {
        const orders = await Order.find({ buyerId }).sort({ createdAt: -1 });
        return orders;
    } catch (error) {
        logger.error(`Error fetching buyer orders: ${error.message}`);
        throw error;
    }
};

/**
 * Get orders by seller ID
 * @param {string} sellerId - Seller ID
 * @returns {Promise<Array>} Array of order objects
 */
export const getOrdersBySellerId = async (sellerId) => {
    try {
        const orders = await Order.find({ sellerId }).sort({ createdAt: -1 });
        return orders;
    } catch (error) {
        logger.error(`Error fetching seller orders: ${error.message}`);
        throw error;
    }
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} sellerId - Seller ID (for authorization)
 * @param {string} status - New order status
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderStatus = async (orderId, sellerId, status) => {
    try {
        // Validate status
        if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            throw createHttpError(400, 'Invalid order status');
        }
        
        // Find order
        const order = await Order.findById(orderId);
        
        if (!order) {
            throw createHttpError(404, 'Order not found');
        }
        
        // Verify seller owns the order
        if (order.sellerId.toString() !== sellerId) {
            throw createHttpError(403, 'Not authorized to update this order');
        }
        
        // If cancelling order, restore product quantities
        if (status === 'cancelled' && order.orderStatus !== 'cancelled') {
            for (const item of order.products) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { quantity: item.quantity }
                });
                
                // Update product status if it was sold-out
                const product = await Product.findById(item.productId);
                if (product.status === 'sold-out' && product.quantity > 0) {
                    product.status = 'active';
                    await product.save();
                }
            }
        }
        
        // Update order status
        order.orderStatus = status;
        await order.save();
        
        logger.info(`Order ${orderId} status updated to ${status} by seller: ${sellerId}`);
        
        return order;
    } catch (error) {
        logger.error(`Error updating order status: ${error.message}`);
        throw error;
    }
};

/**
 * Calculate delivery fee based on distance
 * @param {Array} sellerCoordinates - Seller coordinates [longitude, latitude]
 * @param {Array} buyerCoordinates - Buyer coordinates [longitude, latitude]
 * @param {string} deliveryMethod - Delivery method
 * @returns {Promise<number>} Delivery fee
 */
export const calculateDeliveryFee = async (sellerCoordinates, buyerCoordinates, deliveryMethod) => {
    try {
        if (deliveryMethod === 'pickup') {
            return 0; // No delivery fee for pickup
        }
        
        // Calculate distance between seller and buyer
        const distance = calculateDistance(sellerCoordinates, buyerCoordinates);
        
        // Calculate fee based on distance
        let fee = 0;
        
        if (deliveryMethod === 'delivery') {
            // Local delivery fee calculation
            if (distance <= 5) {
                fee = 10; // Base fee for up to 5km
            } else {
                fee = 10 + (distance - 5) * 1.5; // Base fee + 1.5 per additional km
            }
        } else if (deliveryMethod === 'shipping') {
            // Shipping fee calculation (typically higher)
            fee = 15 + distance * 0.8; // Base fee + 0.8 per km
        }
        
        // Round to 2 decimal places
        return Math.round(fee * 100) / 100;
    } catch (error) {
        logger.error(`Error calculating delivery fee: ${error.message}`);
        throw error;
    }
}; 