import Joi from "joi";
import createHttpError from "http-errors";

/**
 * Joi schema for validating AI prompt data
 */
const promptSchema = Joi.object({
    prompt: Joi.string()
        .required()
        .min(3)
        .max(1000)
        .messages({
            'string.base': `"prompt" should be a text string`,
            'string.empty': `"prompt" cannot be empty`,
            'string.min': `"prompt" should have at least 3 characters`,
            'string.max': `"prompt" should not exceed 1000 characters`,
            'any.required': `"prompt" is required`
        }),
    
    model: Joi.string()
        .valid('gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo')
        .default('gpt-3.5-turbo')
        .messages({
            'string.base': `"model" should be a text string`,
            'any.only': `"model" must be one of the supported models`
        }),
        
    temperature: Joi.number()
        .min(0)
        .max(1)
        .default(0.7)
        .messages({
            'number.base': `"temperature" should be a number`,
            'number.min': `"temperature" should be at least 0`,
            'number.max': `"temperature" should not exceed 1`
        }),
        
    maxTokens: Joi.number()
        .integer()
        .min(50)
        .max(4000)
        .default(1000)
        .messages({
            'number.base': `"maxTokens" should be a number`,
            'number.integer': `"maxTokens" should be an integer`,
            'number.min': `"maxTokens" should be at least 50`,
            'number.max': `"maxTokens" should not exceed 4000`
        })
});

/**
 * Validate AI prompt data using Joi
 * @param {Object} promptData - The prompt data to validate
 * @throws {Error} if validation fails
 */
export const validatePrompt = (promptData) => {
    const { error, value } = promptSchema.validate(promptData);
    if (error) {
        throw createHttpError(400, error.details[0].message);
    }
    return value; // Return validated and default-populated data
};

/**
 * Format AI response for client
 * @param {Object} response - The raw AI response
 * @returns {Object} Formatted response
 */
export const formatAIResponse = (response) => {
    return {
        text: response.choices[0].message.content,
        model: response.model,
        usage: {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens
        },
        created: new Date().toISOString()
    };
};

/**
 * Create a system message for general agricultural context
 * @returns {Object} System message object
 */
export const createAgricultureSystemMessage = () => {
    return {
        role: "system",
        content: `You are an AI agricultural expert specializing in crop management, soil science, 
        agricultural technology, pest management, and sustainable farming practices. 
        
        Provide detailed, practical, and evidence-based advice tailored to the specific 
        agricultural context of the user. Consider regional differences in climate, soil, 
        and farming practices when relevant. Focus on both traditional knowledge and 
        modern scientific approaches to agriculture.
        
        When discussing solutions, prioritize:
        1. Sustainable and environmentally friendly approaches
        2. Cost-effective solutions accessible to farmers with different resource levels
        3. Practical implementation steps
        4. Local adaptability of recommendations
        
        If you're uncertain about region-specific information, acknowledge the limitations 
        and suggest how the user might find locally relevant information.`
    };
};

/**
 * Create a system message for crop disease identification
 * @returns {Object} System message object
 */
export const createCropDiseaseSystemMessage = () => {
    return {
        role: "system",
        content: `You are an AI plant pathologist specializing in the identification and 
        treatment of crop diseases and pest infestations. Your expertise covers a wide range 
        of crops and their common pathogens, including fungi, bacteria, viruses, and insect pests.
        
        When analyzing crop disease symptoms:
        1. Consider multiple possible causes for the symptoms described
        2. Explain how to confirm the specific disease
        3. Provide both organic/biological and conventional treatment options
        4. Include preventive measures for future growing seasons
        5. Mention if the disease poses risks to other nearby crops
        
        Base your analysis on scientific evidence while making the information accessible 
        to farmers with varying levels of technical knowledge.`
    };
};

/**
 * Create a system message for agricultural technology advice
 * @returns {Object} System message object
 */
export const createAgriTechSystemMessage = () => {
    return {
        role: "system",
        content: `You are an AI agricultural technology specialist with expertise in farm 
        mechanization, precision agriculture, IoT applications, drone technology, smart irrigation, 
        and digital farm management systems.
        
        When recommending agricultural technology solutions:
        1. Consider the scale of the farming operation and available resources
        2. Prioritize appropriate technology that matches the user's context
        3. Explain implementation requirements, including skills and infrastructure
        4. Provide realistic cost estimates and potential return on investment
        5. Suggest phased implementation approaches for budget constraints
        
        Balance cutting-edge innovations with practical, accessible solutions that can 
        make a meaningful difference in agricultural productivity and sustainability.`
    };
};

/**
 * Create a system message for soil analysis
 * @returns {Object} System message object
 */
export const createSoilAnalysisSystemMessage = () => {
    return {
        role: "system",
        content: `You are an AI soil scientist specializing in soil health, fertility management, 
        and sustainable soil practices. Your expertise covers soil types, nutrient management, 
        pH balancing, organic matter, and biological soil health.
        
        When analyzing soil information:
        1. Interpret soil characteristics and their implications for crop growth
        2. Recommend appropriate amendments based on soil conditions
        3. Suggest sustainable soil management practices
        4. Provide guidance on crop selection suitable for the soil type
        5. Explain long-term strategies for building soil health
        
        Focus on regenerative approaches that build soil fertility while maintaining 
        productivity and profitability.`
    };
}; 