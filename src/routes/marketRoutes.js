import express from 'express';
import {
    createNewProduct,
    getProduct,
    getSellerProducts,
    updateProductDetails,
    removeProduct,
    getNearbyProducts,
    searchProductsHandler,
    createNewOrder,
    getOrder,
    getBuyerOrders,
    getSellerOrders,
    updateOrderStatusHandler,
    calculateDeliveryFeeHandler
} from '../controllers/marketController.js';
import { requireAuth } from '../middleware/auth-middleware.js';

const router = express.Router();

// All market routes require authentication
router.use(requireAuth);

// Product routes
router.post('/products', createNewProduct);
router.get('/products/:productId', getProduct);
router.get('/products/seller/:sellerId?', getSellerProducts);
router.put('/products/:productId', updateProductDetails);
router.delete('/products/:productId', removeProduct);
router.get('/products/nearby', getNearbyProducts);
router.get('/products/search', searchProductsHandler);

// Order routes
router.post('/orders', createNewOrder);
router.get('/orders/:orderId', getOrder);
router.get('/orders/buyer/:buyerId?', getBuyerOrders);
router.get('/orders/seller/:sellerId?', getSellerOrders);
router.patch('/orders/:orderId/status', updateOrderStatusHandler);

// Utility routes
router.post('/calculate-delivery-fee', calculateDeliveryFeeHandler);

export default router; 