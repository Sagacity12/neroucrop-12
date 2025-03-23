import OpenAI from "openai";
import createHttpError from "http-errors";
import { validatePrompt, createAgricultureSystemMessage, formatAIResponse } from "../helpers/openaihelper.js";
import logger from "../config/logger.js";

// Get OpenAI client (created on demand to ensure environment variables are loaded)
const getOpenAIClient = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key is missing in environment variables");
    }
    
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
};

/**
 * Generate AI response to a prompt
 * @param {Object} promptData - The prompt data
 * @returns {Promise<Object>} Formatted AI response
 */
export const generateAIResponse = async (promptData) => {
    try {
        // Initialize OpenAI client on demand
        const openai = getOpenAIClient();
        
        // Validate prompt data
        const validatedData = validatePrompt(promptData);
        
        // Create messages array with system message and user prompt
        const messages = [
            createAgricultureSystemMessage(),
            { role: "user", content: validatedData.prompt }
        ];

        // Log request (without sensitive data)
        logger.info(`AI request: model=${validatedData.model}, tokens=${validatedData.maxTokens}, temp=${validatedData.temperature}`);
        
        // Make request to OpenAI with v4 API
        const response = await openai.chat.completions.create({
            model: validatedData.model,
            messages: messages,
            temperature: validatedData.temperature,
            max_tokens: validatedData.maxTokens,
        });

        // Log success
        logger.info(`AI response received: ${response.usage.total_tokens} tokens used`);
        
        // Format response for v4 API
        return formatAIResponse(response);
    } catch (error) {
        // Handle OpenAI API errors
        logger.error(`AI service error: ${error.message}`);
        
        if (error.message.includes("API key")) {
            throw createHttpError(500, "OpenAI API key configuration error");
        }
        
        throw createHttpError(500, "Error generating AI response");
    }
};

/**
 * Generate agricultural recommendations based on specific parameters
 * @param {Object} params - Parameters like crop type, region, season
 * @returns {Promise<Object>} Formatted AI response with recommendations
 */
export const generateAgricultureRecommendations = async (params) => {
    const { crop, region, season, concerns } = params;
    
    // Construct a detailed prompt based on parameters
    const prompt = `Please provide detailed recommendations for growing ${crop} in ${region} during the ${season} season. 
    ${concerns ? `I'm particularly concerned about: ${concerns}.` : ''}
    Include information about soil preparation, planting techniques, watering schedule, pest management, and harvesting.`;
    
    // Use the general AI response function with this specialized prompt
    return generateAIResponse({
        prompt,
        model: "gpt-4", // Use more advanced model for agricultural expertise
        temperature: 0.5, // Lower temperature for more factual responses
        maxTokens: 1500 // Allow for detailed response
    });
};

/**
 * Generate crop disease analysis based on symptoms
 * @param {Object} params - Parameters like crop type, symptoms, images
 * @returns {Promise<Object>} Formatted AI response with disease analysis
 */
export const generateCropDiseaseAnalysis = async (params) => {
    const { crop, symptoms, affectedParts, region } = params;
    
    // Construct a detailed prompt based on parameters
    const prompt = `Please analyze these symptoms for a possible disease affecting ${crop} in ${region || 'my region'}.
    
    Symptoms: ${symptoms}
    Affected plant parts: ${affectedParts || 'Not specified'}
    
    Please provide:
    1. Possible diseases that match these symptoms
    2. Confirmation steps to identify the specific disease
    3. Treatment options (organic and chemical if applicable)
    4. Preventive measures for the future
    5. Whether this disease poses risks to other nearby crops`;
    
    // Use the general AI response function with this specialized prompt
    return generateAIResponse({
        prompt,
        model: "gpt-4", // Use more advanced model for disease diagnosis
        temperature: 0.3, // Lower temperature for more factual responses
        maxTokens: 1500 // Allow for detailed response
    });
};

/**
 * Generate agricultural technology advice
 * @param {Object} params - Parameters like farm size, current tech, budget
 * @returns {Promise<Object>} Formatted AI response with agritech advice
 */
export const generateAgriTechAdvice = async (params) => {
    const { farmSize, currentTech, budget, goals, crops } = params;
    
    // Construct a detailed prompt based on parameters
    const prompt = `Please provide agricultural technology recommendations for a ${farmSize || 'small'} farm 
    growing ${crops || 'various crops'} with the following details:
    
    Current technology: ${currentTech || 'Basic traditional farming methods'}
    Budget: ${budget || 'Limited'}
    Goals: ${goals || 'Increase productivity and reduce manual labor'}
    
    Please include:
    1. Appropriate technology solutions considering the budget
    2. Implementation steps and timeline
    3. Expected ROI and benefits
    4. Maintenance requirements
    5. Training needs for farm workers
    6. Specific technology providers or resources if available`;
    
    // Use the general AI response function with this specialized prompt
    return generateAIResponse({
        prompt,
        model: "gpt-4", // Use more advanced model for tech recommendations
        temperature: 0.5,
        maxTokens: 1500
    });
};

/**
 * Generate soil analysis and recommendations
 * @param {Object} params - Parameters like soil type, pH, region
 * @returns {Promise<Object>} Formatted AI response with soil analysis
 */
export const generateSoilAnalysis = async (params) => {
    const { soilType, pH, region, cropPlans, concerns } = params;
    
    // Construct a detailed prompt based on parameters
    const prompt = `Please analyze this soil information and provide recommendations:
    
    Soil type: ${soilType || 'Unknown'}
    pH level: ${pH || 'Unknown'}
    Region: ${region || 'Not specified'}
    Planned crops: ${cropPlans || 'Various crops'}
    Concerns: ${concerns || 'General soil health'}
    
    Please include:
    1. Analysis of soil suitability for the planned crops
    2. Recommended amendments or treatments
    3. Sustainable soil management practices
    4. Crop rotation suggestions if applicable
    5. Long-term soil health strategies`;
    
    // Use the general AI response function with this specialized prompt
    return generateAIResponse({
        prompt,
        model: "gpt-4",
        temperature: 0.4,
        maxTokens: 1500
    });
};

/**
 * Generate weather impact analysis for agriculture
 * @param {Object} params - Parameters like weather forecast, crop type, growth stage
 * @returns {Promise<Object>} Formatted AI response with weather impact analysis
 */
export const generateWeatherImpactAnalysis = async (params) => {
    const { forecast, crops, growthStage, region } = params;
    
    // Construct a detailed prompt based on parameters
    const prompt = `Please analyze how the following weather forecast might impact ${crops || 'my crops'} 
    at ${growthStage || 'current'} growth stage in ${region || 'my region'}:
    
    Weather forecast: ${forecast || 'Not provided'}
    
    Please include:
    1. Potential positive and negative impacts on the crops
    2. Recommended actions to mitigate risks
    3. Adjustments to irrigation schedules if needed
    4. Disease or pest risks that might increase
    5. Long-term considerations if this weather pattern continues`;
    
    // Use the general AI response function with this specialized prompt
    return generateAIResponse({
        prompt,
        model: "gpt-4",
        temperature: 0.4,
        maxTokens: 1200
    });
};

/**
 * Generate market price analysis for agricultural products
 * @param {Object} params - Parameters like crop type, region, season
 * @returns {Promise<Object>} Formatted AI response with market analysis
 */
export const generateMarketPriceAnalysis = async (params) => {
    const { crop, region, season, marketType } = params;
    
    // Construct a detailed prompt based on parameters
    const prompt = `Please provide a market analysis for ${crop || 'agricultural products'} 
    in ${region || 'the local market'} during ${season || 'the current season'} 
    for ${marketType || 'both local and export markets'}:
    
    Please include:
    1. Current price trends and factors affecting them
    2. Price forecast for the coming weeks/months
    3. Supply and demand dynamics
    4. Strategic recommendations for farmers (when to sell, how to add value)
    5. Alternative markets or value-addition opportunities
    6. Relevant market regulations or standards to be aware of`;
    
    // Use the general AI response function with this specialized prompt
    return generateAIResponse({
        prompt,
        model: "gpt-4",
        temperature: 0.5,
        maxTokens: 1200
    });
};

/**
 * Generate an agricultural image based on a prompt
 * @param {Object} params - Parameters for image generation
 * @returns {Promise<Object>} Image URL and metadata
 */
export const generateAgricultureImage = async (params) => {
  try {
    const openai = getOpenAIClient();
    
    const { prompt, size = "1024x1024" } = params;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Agricultural image: ${prompt}`,
      n: 1,
      size: size
    });
    
    return {
      imageUrl: response.data[0].url,
      prompt: prompt,
      created: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Image generation error: ${error.message}`);
    throw error;
  }
};
