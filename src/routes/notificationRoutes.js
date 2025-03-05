import express from 'express';
import { createNotificationController, getNotificationsController } from '../controllers/notificationController.js';

const router = express.Router();

// Route to create a new notification
router.post("/", createNotificationController);

// Route to get notification for a specific user
router.get('/:userId', getNotificationsController);

export default router;