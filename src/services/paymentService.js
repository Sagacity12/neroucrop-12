import Payment from '../models/paymentmodel.js';
import { validatePayment, generatePaymentReference } from '../helpers/paymenthelper.js';
import createHttpError from 'http-errors';
import logger from '../config/logger.js';

/**
 * Create a new payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Created payment
 */
export const createPayment = async (paymentData) => {
    try {
        // Validate payment data
        const validatedData = validatePayment(paymentData);
        
        // Generate payment reference if not provided
        if (!validatedData.paymentDetails?.reference) {
            validatedData.paymentDetails = {
                ...validatedData.paymentDetails,
                reference: generatePaymentReference()
            };
        }
        
        // Create payment record
        const payment = await Payment.create(validatedData);
        
        logger.info(`Payment created: ${payment._id}`);
        
        return payment;
    } catch (error) {
        logger.error(`Error creating payment: ${error.message}`);
        throw error;
    }
};

/**
 * Get payment by ID
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Payment object
 */
export const getPaymentById = async (paymentId) => {
    try {
        const payment = await Payment.findById(paymentId);
        
        if (!payment) {
            throw createHttpError(404, 'Payment not found');
        }
        
        return payment;
    } catch (error) {
        logger.error(`Error fetching payment: ${error.message}`);
        throw error;
    }
};

/**
 * Get payments by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of payment objects
 */
export const getPaymentsByUserId = async (userId) => {
    try {
        const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
        return payments;
    } catch (error) {
        logger.error(`Error fetching user payments: ${error.message}`);
        throw error;
    }
};

/**
 * Update payment status
 * @param {string} paymentId - Payment ID
 * @param {string} status - New payment status
 * @returns {Promise<Object>} Updated payment
 */
export const updatePaymentStatus = async (paymentId, status) => {
    try {
        if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
            throw createHttpError(400, 'Invalid payment status');
        }
        
        const payment = await Payment.findByIdAndUpdate(
            paymentId,
            { status },
            { new: true, runValidators: true }
        );
        
        if (!payment) {
            throw createHttpError(404, 'Payment not found');
        }
        
        logger.info(`Payment ${paymentId} status updated to ${status}`);
        
        return payment;
    } catch (error) {
        logger.error(`Error updating payment status: ${error.message}`);
        throw error;
    }
};

/**
 * Process Mobile Money payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Payment result
 */
export const processMomoPayment = async (paymentData) => {
    try {
        // Validate payment data
        const validatedData = validatePayment({
            ...paymentData,
            paymentMethod: 'momo'
        });
        
        // Generate payment reference
        const reference = generatePaymentReference('MOMO');
        
        // In a real implementation, you would integrate with MTN MoMo API here
        // This is a simplified example
        
        // Create payment record
        const payment = await Payment.create({
            ...validatedData,
            paymentDetails: {
                reference,
                provider: 'MTN',
                phoneNumber: paymentData.phoneNumber,
                transactionId: `MOMO-${Date.now()}`
            }
        });
        
        logger.info(`MoMo payment initiated: ${payment._id}`);
        
        // Return payment with additional MoMo-specific data
        return {
            ...payment.toObject(),
            momoReference: reference,
            instructions: 'Check your phone to confirm payment'
        };
    } catch (error) {
        logger.error(`Error processing MoMo payment: ${error.message}`);
        throw error;
    }
};

/**
 * Process card payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Payment result
 */
export const processCardPayment = async (paymentData) => {
    try {
        // Validate payment data
        const validatedData = validatePayment({
            ...paymentData,
            paymentMethod: 'card'
        });
        
        // Generate payment reference
        const reference = generatePaymentReference('CARD');
        
        // In a real implementation, you would integrate with a payment gateway here
        // This is a simplified example
        
        // Create payment record
        const payment = await Payment.create({
            ...validatedData,
            paymentDetails: {
                reference,
                cardType: paymentData.cardType,
                last4: paymentData.last4,
                transactionId: `CARD-${Date.now()}`
            }
        });
        
        logger.info(`Card payment processed: ${payment._id}`);
        
        return payment;
    } catch (error) {
        logger.error(`Error processing card payment: ${error.message}`);
        throw error;
    }
}; 