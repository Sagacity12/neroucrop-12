import express from 'express';
import {
  searchCoursesHandler,
  getRecentSearchesHandler,
  getCategoriesHandler,
  getCourseDetailsHandler,
  enrollInCourseHandler,
  updateProgressHandler,
  getCertificateHandler,
  getEducationStatsHandler,
  initializeCategoriesHandler
} from '../controllers/educationController.js';
import { requireAuth } from '../middleware/auth-middleware.js';

const router = express.Router();

// Public routes
router.get('/search', searchCoursesHandler);
router.get('/categories', getCategoriesHandler);
router.get('/courses/:courseId', getCourseDetailsHandler);
router.get('/stats', getEducationStatsHandler);

// Protected routes (require authentication)
router.use(requireAuth);
router.get('/recent-searches', getRecentSearchesHandler);
router.post('/courses/:courseId/enroll', enrollInCourseHandler);
router.post('/courses/:courseId/lessons/:lessonId/complete', updateProgressHandler);
router.get('/courses/:courseId/certificate', getCertificateHandler);

// Admin routes
router.post('/initialize-categories', initializeCategoriesHandler);

export default router; 