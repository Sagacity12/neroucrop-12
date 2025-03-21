import {
    createPayment,
    getPaymentById,
    getPaymentsByUserId,
    updatePaymentStatus,
    processMomoPayment,
    processCardPayment
} from '../services/paymentService.js';
import { formatPaymentResponse } from '../helpers/paymenthelper.js';
import logger from '../config/logger.js';

/**
 * Create a new payment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const createNewPayment = async (req, res) => {
    try {
        // Add user ID from authenticated request
        const paymentData = {
            ...req.body,
            userId: req.user._id
        };
        
        const payment = await createPayment(paymentData);
        
        res.status(201).json({
            success: true,
            data: formatPaymentResponse(payment)
        });
    } catch (error) {
        logger.error(`Payment creation error: ${error.message}`);
        throw error; // Let error middleware handle it
    }
};

/**
 * Get payment by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await getPaymentById(paymentId);
        
        // Check if user is authorized to view this payment
        if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this payment'
            });
        }
        
        res.status(200).json({
            success: true,
            data: formatPaymentResponse(payment)
        });
    } catch (error) {
        logger.error(`Get payment error: ${error.message}`);
        throw error;
    }
};

/**
 * Get user payments
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getUserPayments = async (req, res) => {
    try {
        const userId = req.params.userId || req.user._id;
        
        // Check if user is authorized to view these payments
        if (userId !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view these payments'
            });
        }
        
        const payments = await getPaymentsByUserId(userId);
        
        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments.map(formatPaymentResponse)
        });
    } catch (error) {
        logger.error(`Get user payments error: ${error.message}`);
        throw error;
    }
};

/**
 * Update payment status
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const updatePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;
        
        // Only admins can update payment status
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update payment status'
            });
        }
        
        const payment = await updatePaymentStatus(paymentId, status);
        
        res.status(200).json({
            success: true,
            data: formatPaymentResponse(payment)
        });
    } catch (error) {
        logger.error(`Update payment error: ${error.message}`);
        throw error;
    }
};

/**
 * Process Mobile Money payment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const handleMomoPayment = async (req, res) => {
    try {
        const paymentData = {
            ...req.body,
            userId: req.user._id,
            paymentMethod: 'momo'
        };
        
        const payment = await processMomoPayment(paymentData);
        
        res.status(200).json({
            success: true,
            data: {
                ...formatPaymentResponse(payment),
                momoReference: payment.momoReference,
                instructions: payment.instructions
            }
        });
    } catch (error) {
        logger.error(`MoMo payment error: ${error.message}`);
        throw error;
    }
};

/**
 * Process card payment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const handleCardPayment = async (req, res) => {
    try {
        const paymentData = {
            ...req.body,
            userId: req.user._id,
            paymentMethod: 'card'
        };
        
        const payment = await processCardPayment(paymentData);
        
        res.status(200).json({
            success: true,
            data: formatPaymentResponse(payment)
        });
    } catch (error) {
        logger.error(`Card payment error: ${error.message}`);
        throw error;
    }
};

/**
 * Handle payment webhook
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const handlePaymentWebhook = async (req, res) => {
    try {
        const { reference, status, transactionId } = req.body;
        
        // Validate webhook signature (in a real implementation)
        // This would verify the webhook is from your payment provider
        
        logger.info(`Payment webhook received: ${reference}, status: ${status}`);
        
        // Find payment by reference
        const payment = await Payment.findOne({ 'paymentDetails.reference': reference });
        
        if (!payment) {
            logger.error(`Payment not found for reference: ${reference}`);
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }
        
        // Update payment status
        payment.status = status === 'successful' ? 'completed' : 
                         status === 'failed' ? 'failed' : payment.status;
        
        // Update transaction ID if provided
        if (transactionId) {
            payment.paymentDetails.transactionId = transactionId;
        }
        
        await payment.save();
        
        logger.info(`Payment ${payment._id} updated via webhook to status: ${payment.status}`);
        
        // Always return 200 to webhook calls
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });
    } catch (error) {
        logger.error(`Payment webhook error: ${error.message}`);
        // Still return 200 to prevent retries
        res.status(200).json({
            success: false,
            error: 'Error processing webhook'
        });
    }
}; 