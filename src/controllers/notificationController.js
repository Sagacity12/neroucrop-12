import { createNotification, getNotificationsByUserId } from "../services/notificationService.js";
import asyncWrapper from "../middleware/async.js";

/**
 * Handle creating a new notification.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
export const createNotificationController = asyncWrapper(async (req, res) => {
    const notificationData = req.body; // Get notification data from the request body 
    const notification = await createNotification(notificationData); // Call the service to create the notification
    res.status(201).json(notification);// Respond with the created notification
});

/**
 * Handle fetching notification for a user 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
export const getNotificationsController = asyncWrapper(async (req, res) => {
    const userId = req.params.userId; // Get userId from request parameters
        const notifications = await getNotificationsByUserId(userId); // Call the service to get notifications
        res.status(200).json(notifications); // Respond with the notifications 
});