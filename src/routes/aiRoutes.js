import express from 'express';
import { 
    handleAIPrompt, 
    handleAgricultureRecommendations,
    handleCropDiseaseIdentification,
    handleAgriTechAdvice,
    handleSoilAnalysis,
    handleWeatherImpactAnalysis,
    handleMarketPriceAnalysis,
    handleImageGeneration
} from '../controllers/openaiController.js';
import { requireAuth } from '../middleware/auth-middleware.js';

const router = express.Router();

// All AI routes require authentication
router.use(requireAuth);

// General AI prompt endpoint
router.post('/prompt', handleAIPrompt);

// Specialized agriculture endpoints
router.post('/recommendations', handleAgricultureRecommendations);
router.post('/disease-identification', handleCropDiseaseIdentification);
router.post('/agritech', handleAgriTechAdvice);
router.post('/soil-analysis', handleSoilAnalysis);
router.post('/weather-impact', handleWeatherImpactAnalysis);
router.post('/market-analysis', handleMarketPriceAnalysis);

// Image generation endpoint
router.post('/generate-image', handleImageGeneration);

// Add a test route to check OpenAI API key
router.get('/test-key', async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: "OpenAI API key is not configured"
            });
        }
        
        // Just return the first few characters of the key to verify it's loaded
        // (never expose the full API key)
        res.json({
            success: true,
            message: "OpenAI API key is configured",
            keyPreview: `${process.env.OPENAI_API_KEY.substring(0, 5)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
