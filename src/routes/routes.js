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

const baseUrl = "/api/v1";

router.use(`${baseUrl}/auth`, authRoutes);
router.use(`${baseUrl}/notification`, notificationRoutes);

export default router;