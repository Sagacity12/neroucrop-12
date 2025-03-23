import express from 'express';
import { seedEducationHandler } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth-middleware.js';

const router = express.Router();

// All admin routes require authentication
router.use(requireAuth);

// Admin routes
router.post('/seed/education', seedEducationHandler);

export default router; 