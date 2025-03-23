import Joi from "joi";
import createHttpError from "http-errors";
import mongoose from "mongoose";

/**
 * Joi schema for validating course data
 */
const courseSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(5)
    .max(100)
    .messages({
      'string.base': `"title" should be a text string`,
      'string.empty': `"title" cannot be empty`,
      'string.min': `"title" should have at least 5 characters`,
      'string.max': `"title" should not exceed 100 characters`,
      'any.required': `"title" is required`
    }),
    
  description: Joi.string()
    .required()
    .min(20)
    .max(2000)
    .messages({
      'string.base': `"description" should be a text string`,
      'string.empty': `"description" cannot be empty`,
      'string.min': `"description" should have at least 20 characters`,
      'string.max': `"description" should not exceed 2000 characters`,
      'any.required': `"description" is required`
    }),
    
  category: Joi.string()
    .required()
    .messages({
      'string.base': `"category" should be a string`,
      'any.required': `"category" is required`
    }),
    
  instructor: Joi.string()
    .required()
    .messages({
      'string.base': `"instructor" should be a string`,
      'any.required': `"instructor" is required`
    }),
    
  thumbnail: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': `"thumbnail" must be a valid URL`
    }),
    
  duration: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': `"duration" should be a number`,
      'number.integer': `"duration" should be an integer`,
      'number.min': `"duration" should be at least 1 minute`,
      'any.required': `"duration" is required`
    }),
    
  level: Joi.string()
    .valid('Beginner', 'Intermediate', 'Advanced')
    .default('Beginner')
    .messages({
      'string.base': `"level" should be a string`,
      'any.only': `"level" must be one of [Beginner, Intermediate, Advanced]`
    }),
    
  modules: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow(''),
        lessons: Joi.array().items(
          Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            videoUrl: Joi.string().uri().allow(''),
            duration: Joi.number().integer().min(1),
            resources: Joi.array().items(
              Joi.object({
                title: Joi.string().required(),
                fileUrl: Joi.string().uri().required(),
                fileType: Joi.string().required()
              })
            ),
            quiz: Joi.object({
              questions: Joi.array().items(
                Joi.object({
                  question: Joi.string().required(),
                  options: Joi.array().items(Joi.string()).min(2).required(),
                  correctAnswer: Joi.number().integer().min(0).required()
                })
              ),
              passingScore: Joi.number().min(0).max(100).default(70)
            })
          })
        ).min(1).required()
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': `"modules" should be an array`,
      'array.min': `At least one module is required`,
      'any.required': `"modules" is required`
    }),
    
  tags: Joi.array()
    .items(Joi.string())
    .default([]),
    
  price: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.base': `"price" should be a number`,
      'number.min': `"price" should be at least 0`
    }),
    
  isPublished: Joi.boolean()
    .default(false),
    
  isFeatured: Joi.boolean()
    .default(false)
});

/**
 * Joi schema for validating category data
 */
const categorySchema = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(50)
    .messages({
      'string.base': `"name" should be a text string`,
      'string.empty': `"name" cannot be empty`,
      'string.min': `"name" should have at least 3 characters`,
      'string.max': `"name" should not exceed 50 characters`,
      'any.required': `"name" is required`
    }),
    
  description: Joi.string()
    .required()
    .min(10)
    .max(500)
    .messages({
      'string.base': `"description" should be a text string`,
      'string.empty': `"description" cannot be empty`,
      'string.min': `"description" should have at least 10 characters`,
      'string.max': `"description" should not exceed 500 characters`,
      'any.required': `"description" is required`
    }),
    
  icon: Joi.string()
    .allow('')
    .default('')
});

/**
 * Joi schema for validating review data
 */
const reviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': `"rating" should be a number`,
      'number.integer': `"rating" should be an integer`,
      'number.min': `"rating" should be at least 1`,
      'number.max': `"rating" should not exceed 5`,
      'any.required': `"rating" is required`
    }),
    
  review: Joi.string()
    .required()
    .min(10)
    .max(1000)
    .messages({
      'string.base': `"review" should be a text string`,
      'string.empty': `"review" cannot be empty`,
      'string.min': `"review" should have at least 10 characters`,
      'string.max': `"review" should not exceed 1000 characters`,
      'any.required': `"review" is required`
    })
});

/**
 * Validate course data using Joi
 * @param {Object} courseData - The course data to validate
 * @throws {Error} if validation fails
 */
export const validateCourse = (courseData) => {
  const { error, value } = courseSchema.validate(courseData);
  if (error) {
    throw createHttpError(400, error.details[0].message);
  }
  return value; // Return validated and default-populated data
};

/**
 * Validate category data using Joi
 * @param {Object} categoryData - The category data to validate
 * @throws {Error} if validation fails
 */
export const validateCategory = (categoryData) => {
  const { error, value } = categorySchema.validate(categoryData);
  if (error) {
    throw createHttpError(400, error.details[0].message);
  }
  return value; // Return validated and default-populated data
};

/**
 * Validate review data using Joi
 * @param {Object} reviewData - The review data to validate
 * @throws {Error} if validation fails
 */
export const validateReview = (reviewData) => {
  const { error, value } = reviewSchema.validate(reviewData);
  if (error) {
    throw createHttpError(400, error.details[0].message);
  }
  return value; // Return validated and default-populated data
};

/**
 * Format course response for client
 * @param {Object} course - The course object from database
 * @returns {Object} Formatted course response
 */
export const formatCourseResponse = (course) => {
  return {
    id: course._id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    category: course.category,
    instructor: course.instructor,
    thumbnail: course.thumbnail,
    duration: course.duration,
    level: course.level,
    modules: course.modules.map(module => ({
      id: module._id,
      title: module.title,
      description: module.description,
      lessonsCount: module.lessons.length
    })),
    enrolledStudents: course.enrolledStudents,
    ratings: course.ratings,
    tags: course.tags,
    price: course.price,
    isFeatured: course.isFeatured,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt
  };
};

/**
 * Format course details response with full lesson information
 * @param {Object} course - The course object from database
 * @returns {Object} Formatted course details response
 */
export const formatCourseDetailsResponse = (course) => {
  return {
    id: course._id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    category: course.category,
    instructor: course.instructor,
    thumbnail: course.thumbnail,
    duration: course.duration,
    level: course.level,
    modules: course.modules,
    enrolledStudents: course.enrolledStudents,
    ratings: course.ratings,
    tags: course.tags,
    price: course.price,
    isFeatured: course.isFeatured,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt
  };
};

/**
 * Format certificate response for client
 * @param {Object} certificate - The certificate object from database
 * @returns {Object} Formatted certificate response
 */
export const formatCertificateResponse = (certificate) => {
  return {
    id: certificate._id,
    certificateId: certificate.certificateId,
    user: certificate.user,
    course: certificate.course,
    issueDate: certificate.issueDate,
    verificationLink: certificate.verificationLink
  };
};

/**
 * Generate a slug from a string
 * @param {string} text - The text to convert to a slug
 * @returns {string} The generated slug
 */
export const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
};

/**
 * Calculate total duration of a course from its modules and lessons
 * @param {Array} modules - Array of course modules
 * @returns {number} Total duration in minutes
 */
export const calculateCourseDuration = (modules) => {
  let totalDuration = 0;
  
  modules.forEach(module => {
    module.lessons.forEach(lesson => {
      if (lesson.duration) {
        totalDuration += lesson.duration;
      }
    });
  });
  
  return totalDuration;
};

/**
 * Format duration in minutes to hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  }
  
  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
};

/**
 * Check if a MongoDB ID is valid
 * @param {string} id - The ID to check
 * @returns {boolean} Whether the ID is valid
 */
export const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Calculate average rating from an array of reviews
 * @param {Array} reviews - Array of review objects with rating property
 * @returns {number} Average rating rounded to 1 decimal place
 */
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return 0;
  }
  
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  const average = sum / reviews.length;
  
  return Math.round(average * 10) / 10; // Round to 1 decimal place
}; 