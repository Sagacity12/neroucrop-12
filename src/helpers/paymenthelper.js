import Joi from "joi";
import createHttpError from "http-errors";

/**
 * Joi schema for validating payment data
 */
const paymentSchema = Joi.object({
    userId: Joi.string()
        .required()
        .messages({
            'string.base': `"userId" should be a string`,
            'any.required': `"userId" is required`
        }),
    
    amount: Joi.number()
        .required()
        .positive()
        .messages({
            'number.base': `"amount" should be a number`,
            'number.positive': `"amount" should be positive`,
            'any.required': `"amount" is required`
        }),
        
    currency: Joi.string()
        .valid('USD', 'GHS', 'EUR', 'GBP', 'NGN')
        .default('GHS')
        .messages({
            'string.base': `"currency" should be a string`,
            'any.only': `"currency" must be one of the supported currencies`
        }),
        
    paymentMethod: Joi.string()
        .valid('momo', 'card', 'bank', 'crypto')
        .required()
        .messages({
            'string.base': `"paymentMethod" should be a string`,
            'any.only': `"paymentMethod" must be one of the supported methods`,
            'any.required': `"paymentMethod" is required`
        }),
        
    status: Joi.string()
        .valid('pending', 'completed', 'failed', 'refunded')
        .default('pending')
        .messages({
            'string.base': `"status" should be a string`,
            'any.only': `"status" must be one of the valid statuses`
        }),
        
    orderId: Joi.string()
        .allow(null, '')
        .messages({
            'string.base': `"orderId" should be a string`
        }),
        
    description: Joi.string()
        .max(500)
        .allow(null, '')
        .messages({
            'string.base': `"description" should be a string`,
            'string.max': `"description" should not exceed 500 characters`
        }),
        
    paymentDetails: Joi.object().unknown(true)
});

/**
 * Validate payment data using Joi
 * @param {Object} paymentData - The payment data to validate
 * @throws {Error} if validation fails
 */
export const validatePayment = (paymentData) => {
    const { error, value } = paymentSchema.validate(paymentData);
    if (error) {
        throw createHttpError(400, error.details[0].message);
    }
    return value; // Return validated and default-populated data
};

/**
 * Format payment response for client
 * @param {Object} payment - The payment object from database
 * @returns {Object} Formatted payment response
 */
export const formatPaymentResponse = (payment) => {
    return {
        id: payment._id,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        orderId: payment.orderId,
        description: payment.description,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        // Don't include sensitive payment details in response
        paymentReference: payment.paymentDetails?.reference || null
    };
};

/**
 * Generate a unique payment reference
 * @param {string} prefix - Optional prefix for the reference
 * @returns {string} Unique payment reference
 */
export const generatePaymentReference = (prefix = 'PAY') => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${random}`;
}; 