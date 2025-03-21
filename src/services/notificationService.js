import Notification from '../models/notificationmodel.js';
import User from '../models/usermodel.js';
import Product from '../models/marketmodel.js';
import Order from '../models/ordermodel.js';
import { validatenotification } from '../helpers/notificationhelper.js';
import { sendEmail, generateOrderEmailContent } from './emailService.js';
import createHttpError from 'http-errors';
import logger from '../config/logger.js';

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (notificationData) => {
    try {
        // Validate notification data
        validatenotification(notificationData);
        
        // Verify user exists
        const user = await User.findById(notificationData.userId);
        if (!user) {
            throw createHttpError(404, 'User not found');
        }
        
        // Create notification
        const notification = await Notification.create({
            user: notificationData.userId,
            type: notificationData.type,
            content: notificationData.content,
            data: notificationData.data || {},
            isRead: false
        });
        
        logger.info(`Notification created: ${notification._id} for user: ${notification.user}`);
        
        return notification;
    } catch (error) {
        logger.error(`Error creating notification: ${error.message}`);
        throw error;
    }
};

/**
 * Get notifications for a specific user
 * @param {string} userId - User ID
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Promise<Array>} Array of notification objects
 */
export const getNotificationsByUserId = async (userId, options = {}) => {
    try {
        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            throw createHttpError(404, 'User not found');
        }
        
        // Set default options
        const { 
            limit = 20, 
            skip = 0, 
            sort = { createdAt: -1 }, 
            unreadOnly = false 
        } = options;
        
        // Build query
        const query = { user: userId };
        
        // Add filter for unread notifications if requested
        if (unreadOnly) {
            query.isRead = false;
        }
        
        // Execute query with pagination
        const notifications = await Notification.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        // Get total count (for pagination)
        const total = await Notification.countDocuments(query);
        
        logger.info(`Retrieved ${notifications.length} notifications for user ${userId}`);
        
        return {
            notifications,
            total,
            unreadCount: unreadOnly ? total : await Notification.countDocuments({ user: userId, isRead: false })
        };
    } catch (error) {
        logger.error(`Error fetching notifications: ${error.message}`);
        throw error;
    }
};

/**
 * Send order notification - handles both in-app and email notifications
 * @param {string} type - Notification type: new-order, order-status-update, etc.
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Notification result
 */
export const sendOrderNotification = async (type, orderId) => {
    try {
        // Fetch order with buyer and seller details
        const order = await Order.findById(orderId);
        if (!order) {
            throw createHttpError(404, 'Order not found');
        }
        
        // Fetch buyer and seller
        const [buyer, seller] = await Promise.all([
            User.findById(order.buyerId),
            User.findById(order.sellerId)
        ]);
        
        if (!buyer || !seller) {
            throw createHttpError(404, 'Buyer or seller not found');
        }
        
        // Fetch product details for the order
        const productIds = order.products.map(p => p.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        
        // Map product details with quantities from order
        const productDetails = order.products.map(orderProduct => {
            const productInfo = products.find(p => p._id.toString() === orderProduct.productId.toString());
            return {
                id: orderProduct.productId,
                name: productInfo?.name || orderProduct.name || 'Unknown Product',
                price: orderProduct.price,
                quantity: orderProduct.quantity
            };
        });
        
        // Determine notification recipient based on type
        let recipient;
        let notificationType;
        let notificationContent;
        
        switch (type) {
            case 'new-order':
                // Notify seller about new order
                recipient = seller;
                notificationType = 'order';
                notificationContent = `New order #${order._id} received from ${buyer.fullname}`;
                break;
                
            case 'order-status-update':
                // Notify buyer about order status update
                recipient = buyer;
                notificationType = 'order';
                notificationContent = `Your order #${order._id} status has been updated to: ${order.orderStatus}`;
                break;
                
            case 'payment-received':
                // Notify seller about payment received
                recipient = seller;
                notificationType = 'payment';
                notificationContent = `Payment received for order #${order._id}`;
                break;
                
            default:
                throw createHttpError(400, 'Invalid notification type');
        }
        
        // Create in-app notification
        const notification = await createNotification({
            userId: recipient._id,
            type: notificationType,
            content: notificationContent,
            data: { orderId: order._id }
        });
        
        // Send email notification
        const emailData = {
            order,
            buyer,
            seller,
            productDetails
        };
        
        const { subject, text } = generateOrderEmailContent(type, emailData);
        
        try {
            await sendEmail({
                to: recipient.email,
                subject,
                text
            });
            
            logger.info(`Order notification email sent to ${recipient.email} for order ${order._id}`);
        } catch (emailError) {
            logger.error(`Failed to send email notification: ${emailError.message}`);
            // Continue even if email fails - at least the in-app notification is created
        }
        
        return { notification, emailSent: true };
    } catch (error) {
        logger.error(`Error sending order notification: ${error.message}`);
        throw error;
    }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findById(notificationId);
        
        if (!notification) {
            throw createHttpError(404, 'Notification not found');
        }
        
        // Verify user owns the notification
        if (notification.user.toString() !== userId) {
            throw createHttpError(403, 'Not authorized to update this notification');
        }
        
        // Update notification
        notification.isRead = true;
        await notification.save();
        
        return notification;
    } catch (error) {
        logger.error(`Error marking notification as read: ${error.message}`);
        throw error;
    }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with count of updated notifications
 */
export const markAllNotificationsAsRead = async (userId) => {
    try {
        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            throw createHttpError(404, 'User not found');
        }
        
        // Update all unread notifications for this user
        const result = await Notification.updateMany(
            { user: userId, isRead: false },
            { isRead: true }
        );
        
        logger.info(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);
        
        return {
            success: true,
            count: result.modifiedCount
        };
    } catch (error) {
        logger.error(`Error marking all notifications as read: ${error.message}`);
        throw error;
    }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Result of deletion
 */
export const deleteNotification = async (notificationId, userId) => {
    try {
        const notification = await Notification.findById(notificationId);
        
        if (!notification) {
            throw createHttpError(404, 'Notification not found');
        }
        
        // Verify user owns the notification
        if (notification.user.toString() !== userId) {
            throw createHttpError(403, 'Not authorized to delete this notification');
        }
        
        // Delete the notification
        await notification.deleteOne();
        
        return {
            success: true,
            message: 'Notification deleted successfully'
        };
    } catch (error) {
        logger.error(`Error deleting notification: ${error.message}`);
        throw error;
    }
};