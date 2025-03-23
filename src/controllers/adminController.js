import { initializeCategories } from '../services/educationService.js';
import { seedEducationData } from '../scripts/seedEducation.js';
import logger from '../config/logger.js';

/**
 * Seed education data (admin only)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const seedEducationHandler = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can seed education data'
      });
    }
    
    // Run the seed function
    await seedEducationData();
    
    res.status(200).json({
      success: true,
      message: 'Education data seeded successfully'
    });
  } catch (error) {
    logger.error(`Seed education error: ${error.message}`);
    throw error;
  }
}; 