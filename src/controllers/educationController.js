import {
  searchCourses,
  getRecentSearches,
  getCategories,
  getCourseDetails,
  enrollInCourse,
  updateProgress,
  generateCertificate,
  getEducationStats,
  initializeCategories
} from '../services/educationService.js';
import logger from '../config/logger.js';

/**
 * Search for courses
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const searchCoursesHandler = async (req, res) => {
  try {
    const userId = req.user?._id;
    const results = await searchCourses(req.query, userId);
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error(`Search courses error: ${error.message}`);
    throw error;
  }
};

/**
 * Get recent searches for the current user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getRecentSearchesHandler = async (req, res) => {
  try {
    const userId = req.user._id;
    const searches = await getRecentSearches(userId);
    
    res.status(200).json({
      success: true,
      data: searches
    });
  } catch (error) {
    logger.error(`Get recent searches error: ${error.message}`);
    throw error;
  }
};

/**
 * Get course categories
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getCategoriesHandler = async (req, res) => {
  try {
    const categories = await getCategories();
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error(`Get categories error: ${error.message}`);
    throw error;
  }
};

/**
 * Get course details
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getCourseDetailsHandler = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await getCourseDetails(courseId);
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    logger.error(`Get course details error: ${error.message}`);
    throw error;
  }
};

/**
 * Enroll in a course
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const enrollInCourseHandler = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    
    const result = await enrollInCourse(userId, courseId);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`Enroll in course error: ${error.message}`);
    throw error;
  }
};

/**
 * Update course progress
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const updateProgressHandler = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, lessonId } = req.params;
    
    const progress = await updateProgress(userId, courseId, lessonId);
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.error(`Update progress error: ${error.message}`);
    throw error;
  }
};

/**
 * Get certificate for a completed course
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getCertificateHandler = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    
    const certificate = await generateCertificate(userId, courseId);
    
    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    logger.error(`Get certificate error: ${error.message}`);
    throw error;
  }
};

/**
 * Get education dashboard statistics
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getEducationStatsHandler = async (req, res) => {
  try {
    const stats = await getEducationStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error(`Get education stats error: ${error.message}`);
    throw error;
  }
};

/**
 * Initialize default categories (admin only)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const initializeCategoriesHandler = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can initialize categories'
      });
    }
    
    await initializeCategories();
    
    res.status(200).json({
      success: true,
      message: 'Categories initialized successfully'
    });
  } catch (error) {
    logger.error(`Initialize categories error: ${error.message}`);
    throw error;
  }
}; 