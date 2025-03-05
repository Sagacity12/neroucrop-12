import Notification from '../models/notificationmodel.js';
import { validatenotification, formatNotificationResponse } from '../helpers/notificationhelper.js';

/**
 * Create a new notification 
 * @param {object} notification - The notification data to create
 * @returns {object} The created notification.
 * @throws {Error} if validation fails or if there is an error saving the notification.
 */
export const createNotification = async (notificationData) => {
    validatenotification(notificationData); // validate the notification data
    const notification = new Notification(notificationData); // Create a new notification instance
    await notification.save(); // Save the notification to the database
    return formatNotificationResponse(notification); //Return the formatted notification 
};

/**
 * Get all notification for user
 * @param {String} userId - The ID of the user to fetch notification for.
 * @returns {Array} An array of formatted notifications.
 */
export const getNotificationsByUserId = async (userId) => {
    const notification = await Notification.find({ user: userId }); // fetch Notification from the Database
    return notification.map(formatNotificationResponse); //Return formatted notifications
};