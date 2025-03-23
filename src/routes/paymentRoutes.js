import express from 'express';
import {
    createNewPayment,
    getPayment,
    getUserPayments,
    updatePayment,
    handleMomoPayment,
    handleCardPayment,
    handlePaymentWebhook
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth-middleware.js';

const router = express.Router();

// Protect all payment routes except webhook
router.use('/webhook', handlePaymentWebhook);
router.use(requireAuth);

// Payment routes
router.post('/', createNewPayment);
router.get('/:paymentId', getPayment);
router.get('/user/:userId?', getUserPayments);
router.patch('/:paymentId', updatePayment);

// Payment method specific routes
router.post('/momo', handleMomoPayment);
router.post('/card', handleCardPayment);

export default router; 