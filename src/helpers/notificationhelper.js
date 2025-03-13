import Joi from "joi";
import createHttpError from "http-errors";

/**
 * Joi schema for validating notification data.
 */
const notificationSchema = Joi.object({
    userId: Joi.string()
                .required()
                .messages({
        'string.base': `"userId" should be a type of 'text'`,
        'any.required': `"userId" is a required field` 
    }),
    type: Joi.string()
        .valid('message', 'purchase', 'system')
        .required()
        .messages({
            'string.base': `"type" should be a type of text`,
            'any.only': `"type"must be one of [message, purchase, system]`,
            'any.required': `"type" is a required field`
        }),
    content: Joi.string().required().messages({
        'string.base': `"content" should be a type of 'text'`,
        'any.required': `"type" is a required field`
    }),   
});

/**
 * validate notificcation data using joi
 * @param {Object} notification - The notification data to validate.
 * @throws {Error} if validation fails.
 */
export const validatenotification = (notificationData) => {
    const { error } = notificationSchema.validate(notificationData);
    if ( error ) {
        // Throw a custom HTTP error that can be handled by the error middleware 
        throw createHttpError(400, error.details[0].message);
    }
};

/**
 * Format a notification object for response.
 * @param {object} notification - The notification object to fromat.
 * @returns {Object} the formatted notification object.
 */
export const formatNotificationResponse = (notification) => {
    return{
        id: notification._id,
        user: notification.user,
        type: notification.type,
        content: notification.content,
        isRead: notification.isRead,
        createAt: notification.createAt, 
    };
};

/**
 * Checks if the notification is unread.
 * @param {Object} notification - The object to check.
 * @returns {boolean} True if the notification is unread, false otherwise
 */
export const isNotificationUnread = (notification) => {
    return !notification.isRead; // Assuming isRead is a boolean indicating read status 
};