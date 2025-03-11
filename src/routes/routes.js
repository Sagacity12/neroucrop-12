import express from "express";
import authRoutes from './auth-routes.js';
import notificationRoutes from './notificationRoutes.js';
import blog from './blog.js'

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
router.use(`${baseUrl}/blog`, blog);


export default router;