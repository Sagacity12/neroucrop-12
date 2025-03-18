import express from "express";
import authenticateUser from "../middleware/auth.js";
import authRoutes from './auth-routes.js';
import notificationRoutes from './notificationRoutes.js';
import productRoutes from './productRoutes.js';

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
router.use(`${baseUrl}/product`, authenticateUser, productRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

export default router;