import { Category, Course, Progress, Certificate, SearchHistory, Review } from '../models/educationmodel.js';
import User from '../models/usermodel.js';
import createHttpError from 'http-errors';
import crypto from 'crypto';
import logger from '../config/logger.js';
import { sendEducationEmail } from './emailService.js';

/**
 * Search for courses
 * @param {Object} params - Search parameters
 * @param {string} userId - User ID for tracking search history
 * @returns {Promise<Object>} Search results
 */
export const searchCourses = async (params, userId) => {
  try {
    const { query, category, level, sort = 'newest', page = 1, limit = 10 } = params;
    
    // Build search criteria
    const searchCriteria = {};
    
    if (query) {
      searchCriteria.$text = { $search: query };
    }
    
    if (category) {
      const categoryObj = await Category.findOne({ slug: category });
      if (categoryObj) {
        searchCriteria.category = categoryObj._id;
      }
    }
    
    if (level) {
      searchCriteria.level = level;
    }
    
    // Only show published courses
    searchCriteria.isPublished = true;
    
    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'popular':
        sortOptions = { enrolledStudents: -1 };
        break;
      case 'rating':
        sortOptions = { 'ratings.average': -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute search
    const courses = await Course.find(searchCriteria)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name slug')
      .populate('instructor', 'firstname lastname profilePic');
    
    // Get total count for pagination
    const total = await Course.countDocuments(searchCriteria);
    
    // Save search history if user is logged in and query exists
    if (userId && query) {
      await SearchHistory.create({
        user: userId,
        query,
        results: total
      });
    }
    
    return {
      courses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error(`Error searching courses: ${error.message}`);
    throw error;
  }
};

/**
 * Get recent searches for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Recent searches
 */
export const getRecentSearches = async (userId) => {
  try {
    return await SearchHistory.find({ user: userId })
      .sort({ searchedAt: -1 })
      .limit(5);
  } catch (error) {
    logger.error(`Error getting recent searches: ${error.message}`);
    throw error;
  }
};

/**
 * Get course categories with counts
 * @returns {Promise<Array>} Categories with course counts
 */
export const getCategories = async () => {
  try {
    return await Category.find().sort({ name: 1 });
  } catch (error) {
    logger.error(`Error getting categories: ${error.message}`);
    throw error;
  }
};

/**
 * Get course details
 * @param {string} courseId - Course ID or slug
 * @returns {Promise<Object>} Course details
 */
export const getCourseDetails = async (courseId) => {
  try {
    const course = await Course.findOne({ 
      $or: [
        { _id: mongoose.isValidObjectId(courseId) ? courseId : null },
        { slug: courseId }
      ]
    })
    .populate('category', 'name slug')
    .populate('instructor', 'firstname lastname profilePic');
    
    if (!course) {
      throw createHttpError(404, 'Course not found');
    }
    
    return course;
  } catch (error) {
    logger.error(`Error getting course details: ${error.message}`);
    throw error;
  }
};

/**
 * Enroll user in a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Enrollment result
 */
export const enrollInCourse = async (userId, courseId) => {
  try {
    // Check if course exists
    const course = await Course.findById(courseId)
      .populate('instructor', 'firstname lastname');
    
    if (!course) {
      throw createHttpError(404, 'Course not found');
    }
    
    // Get user data for email
    const user = await User.findById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    
    // Check if user is already enrolled
    const existingProgress = await Progress.findOne({ user: userId, course: courseId });
    if (existingProgress) {
      return { message: 'Already enrolled in this course', progress: existingProgress };
    }
    
    // Create progress record
    const progress = await Progress.create({
      user: userId,
      course: courseId,
      startedAt: new Date()
    });
    
    // Increment enrolled students count
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledStudents: 1 } });
    
    // Send enrollment confirmation email
    try {
      await sendEducationEmail('enrollment', { course, user });
      logger.info(`Enrollment email sent to ${user.email} for course ${course.title}`);
    } catch (emailError) {
      logger.error(`Failed to send enrollment email: ${emailError.message}`);
      // Continue even if email fails
    }
    
    return { message: 'Successfully enrolled in course', progress };
  } catch (error) {
    logger.error(`Error enrolling in course: ${error.message}`);
    throw error;
  }
};

/**
 * Update user progress in a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Updated progress
 */
export const updateProgress = async (userId, courseId, lessonId) => {
  try {
    // Find user progress
    let progress = await Progress.findOne({ user: userId, course: courseId });
    
    if (!progress) {
      throw createHttpError(404, 'Not enrolled in this course');
    }
    
    // Check if lesson is already completed
    const lessonCompleted = progress.completedLessons.some(lesson => lesson.lessonId === lessonId);
    
    if (!lessonCompleted) {
      // Add lesson to completed lessons
      progress.completedLessons.push({
        lessonId,
        completedAt: new Date()
      });
      
      // Get course to calculate progress percentage
      const course = await Course.findById(courseId)
        .populate('instructor', 'firstname lastname');
      
      // Get user data for email
      const user = await User.findById(userId);
      
      // Calculate total lessons
      let totalLessons = 0;
      course.modules.forEach(module => {
        totalLessons += module.lessons.length;
      });
      
      // Calculate progress percentage
      const completedPercentage = (progress.completedLessons.length / totalLessons) * 100;
      progress.progress = Math.round(completedPercentage);
      
      // Check if course is completed
      if (progress.progress >= 100 && !progress.isCompleted) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
        
        // Send course completion email
        try {
          await sendEducationEmail('completion', { course, user });
          logger.info(`Completion email sent to ${user.email} for course ${course.title}`);
        } catch (emailError) {
          logger.error(`Failed to send completion email: ${emailError.message}`);
          // Continue even if email fails
        }
        
        // Generate certificate
        const certificate = await generateCertificate(userId, courseId);
        
        // Send certificate email
        try {
          await sendEducationEmail('certificate', { course, user, certificate });
          logger.info(`Certificate email sent to ${user.email} for course ${course.title}`);
        } catch (emailError) {
          logger.error(`Failed to send certificate email: ${emailError.message}`);
          // Continue even if email fails
        }
      }
      
      // Update last accessed
      progress.lastAccessedAt = new Date();
      
      // Save progress
      await progress.save();
    }
    
    return progress;
  } catch (error) {
    logger.error(`Error updating progress: ${error.message}`);
    throw error;
  }
};

/**
 * Generate certificate for completed course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Generated certificate
 */
export const generateCertificate = async (userId, courseId) => {
  try {
    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({ user: userId, course: courseId });
    
    if (existingCertificate) {
      return existingCertificate;
    }
    
    // Get course and user data
    const course = await Course.findById(courseId)
      .populate('instructor', 'firstname lastname');
    
    const user = await User.findById(userId);
    
    if (!course || !user) {
      throw createHttpError(404, 'Course or user not found');
    }
    
    // Generate unique certificate ID
    const certificateId = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now().toString().slice(-6)}`;
    
    // Create verification link
    const verificationLink = `https://agricsmart.com/verify-certificate/${certificateId}`;
    
    // Create certificate
    const certificate = await Certificate.create({
      user: userId,
      course: courseId,
      certificateId,
      issueDate: new Date(),
      verificationLink
    });
    
    // Send certificate email
    try {
      await sendEducationEmail('certificate', { course, user, certificate });
      logger.info(`Certificate email sent to ${user.email} for course ${course.title}`);
    } catch (emailError) {
      logger.error(`Failed to send certificate email: ${emailError.message}`);
      // Continue even if email fails
    }
    
    return certificate;
  } catch (error) {
    logger.error(`Error generating certificate: ${error.message}`);
    throw error;
  }
};

/**
 * Get education dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getEducationStats = async () => {
  try {
    const totalCourses = await Course.countDocuments({ isPublished: true });
    const totalStudents = await User.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalCompletions = await Certificate.countDocuments();
    
    // Get category statistics
    const categories = await Category.find().sort({ coursesCount: -1 }).limit(5);
    
    // Get featured courses
    const featuredCourses = await Course.find({ isFeatured: true, isPublished: true })
      .sort({ enrolledStudents: -1 })
      .limit(6)
      .populate('category', 'name slug')
      .populate('instructor', 'firstname lastname profilePic');
    
    return {
      stats: {
        totalCourses,
        totalStudents,
        totalCategories,
        totalCompletions
      },
      topCategories: categories,
      featuredCourses
    };
  } catch (error) {
    logger.error(`Error getting education stats: ${error.message}`);
    throw error;
  }
};

/**
 * Initialize default course categories
 */
export const initializeCategories = async () => {
  try {
    const categories = [
      {
        name: 'Organic Farming',
        description: 'Learn sustainable organic farming practices, soil health management, and natural pest control.',
        coursesCount: 15000,
        icon: 'leaf'
      },
      {
        name: 'Agriculture Economics',
        description: 'Understand agricultural markets, farm management, and economic principles for successful farming.',
        coursesCount: 15000,
        icon: 'chart-line'
      },
      {
        name: 'Agricultural Digital Technology',
        description: 'Explore precision agriculture, IoT applications, drones, and digital tools for modern farming.',
        coursesCount: 15000,
        icon: 'microchip'
      },
      {
        name: 'Animal Care Skills',
        description: 'Master animal husbandry, veterinary care basics, and livestock management techniques.',
        coursesCount: 15000,
        icon: 'paw'
      }
    ];
    
    for (const category of categories) {
      // Check if category exists
      const existingCategory = await Category.findOne({ name: category.name });
      
      if (!existingCategory) {
        await Category.create(category);
        logger.info(`Created category: ${category.name}`);
      }
    }
    
    logger.info('Categories initialized successfully');
  } catch (error) {
    logger.error(`Error initializing categories: ${error.message}`);
    throw error;
  }
}; 