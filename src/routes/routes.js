import express from "express";
import authRoutes from './auth-routes.js';
import notificationRoutes from './notificationRoutes.js';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    next();
});

// Health check endpoint
router.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

const baseUrl = "/api/v1";

router.use(`${baseUrl}/auth`, authRoutes);
router.use(`${baseUrl}/notification`, notificationRoutes);

export default router;