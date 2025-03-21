import { 
    generateAIResponse, 
    generateAgricultureRecommendations,
    generateCropDiseaseAnalysis,
    generateAgriTechAdvice,
    generateSoilAnalysis,
    generateWeatherImpactAnalysis,
    generateMarketPriceAnalysis,
    generateAgricultureImage
} from "../services/openaiService.js";
import logger from "../config/logger.js";

/**
 * Handle general AI prompt requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const handleAIPrompt = async (req, res) => {
    try {
        logger.info(`AI prompt request received from user: ${req.user?._id || 'unauthenticated'}`);
        
        const response = await generateAIResponse(req.body);
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error(`AI prompt error: ${error.message}`);
        throw error; // Let the error middleware handle it
    }
};

/**
 * Handle agricultural recommendations requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const handleAgricultureRecommendations = async (req, res) => {
    try {
        logger.info(`Agriculture recommendations request received from user: ${req.user?._id || 'unauthenticated'}`);
        
        const response = await generateAgricultureRecommendations(req.body);
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error(`Agriculture recommendations error: ${error.message}`);
        throw error; // Let the error middleware handle it
    }
};

/**
 * Handle crop disease identification requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const handleCropDiseaseIdentification = async (req, res) => {
    try {
        logger.info(`Crop disease identification request received from user: ${req.user?._id || 'unauthenticated'}`);
        
        const response = await generateCropDiseaseAnalysis(req.body);
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error(`Crop disease identification error: ${error.message}`);
        throw error;
    }
};

/**
 * Handle agricultural technology advice requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const handleAgriTechAdvice = async (req, res) => {
    try {
        logger.info(`AgriTech advice request received from user: ${req.user?._id || 'unauthenticated'}`);
        
        const response = await generateAgriTechAdvice(req.body);
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error(`AgriTech advice error: ${error.message}`);
        throw error;
    }
};

/**
 * Handle soil analysis requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const handleSoilAnalysis = async (req, res) => {
    try {
        logger.info(`Soil analysis request received from user: ${req.user?._id || 'unauthenticated'}`);
        
        const response = await generateSoilAnalysis(req.body);
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error(`Soil analysis error: ${error.message}`);
        throw error;
    }
};

/**
 * Handle weather impact analysis requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const handleWeatherImpactAnalysis = async (req, res) => {
    try {
        logger.info(`Weather impact analysis request received from user: ${req.user?._id || 'unauthenticated'}`);
        
        const response = await generateWeatherImpactAnalysis(req.body);
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error(`Weather impact analysis error: ${error.message}`);
        throw error;
    }
};

/**
 * Handle market price analysis requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const handleMarketPriceAnalysis = async (req, res) => {
    try {
        logger.info(`Market price analysis request received from user: ${req.user?._id || 'unauthenticated'}`);
        
        const response = await generateMarketPriceAnalysis(req.body);
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error(`Market price analysis error: ${error.message}`);
        throw error;
    }
};

/**
 * Handle agricultural image generation requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const handleImageGeneration = async (req, res) => {
    try {
        logger.info(`Image generation request received from user: ${req.user?._id || 'unauthenticated'}`);
        
        const { prompt, size } = req.body;
        
        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: "Prompt is required for image generation"
            });
        }
        
        // Validate size if provided
        if (size && !['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'].includes(size)) {
            return res.status(400).json({
                success: false,
                error: "Invalid size. Supported sizes: 256x256, 512x512, 1024x1024, 1792x1024, 1024x1792"
            });
        }
        
        const response = await generateAgricultureImage({
            prompt,
            size: size || "1024x1024"
        });
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error(`Image generation error: ${error.message}`);
        
        // Handle specific OpenAI errors
        if (error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                error: "Rate limit exceeded. Please try again later."
            });
        }
        
        throw error;
    }
}; 