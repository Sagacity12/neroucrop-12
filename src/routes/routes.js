import express from "express";
import authRoutes from './auth-routes.js';
import notificationRoutes from './notificationRoutes.js';
import aiRoutes from './aiRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import marketRoutes from './marketRoutes.js';
import educationRoutes from './educationRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Debug middleware to log requests
router.use((req, res, next) => {
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    next();
});

// Base API routes
const baseUrl = "/api/v1";

// Mount routes
router.use(`${baseUrl}/auth`, authRoutes);
router.use(`${baseUrl}/notification`, notificationRoutes);
router.use(`${baseUrl}/ai`, aiRoutes);
router.use(`${baseUrl}/payments`, paymentRoutes);
router.use(`${baseUrl}/market`, marketRoutes);
router.use(`${baseUrl}/education`, educationRoutes);
router.use(`${baseUrl}/admin`, adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

export default router;