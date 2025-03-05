import Joi from 'joi';
import createHttpError from 'http-errors';

/**
 * Validation schema for user registration 
 * @type {Joi.ObjectSchema}
 */
const registerSchema = Joi.object({
    fullname: Joi.string()
        .required()
        .max(50)
        .messages({
            'string.base': 'Fullname must be a string',
            'string.empty': 'Fullname is required',
            'string.max': 'Fullname cannot be more than 50 characters'
        }),
    username: Joi.string()
        .required()
        .max(50)
        .messages({
            'string.base': 'Username must be a string',
            'string.empty': 'Username is required',
            'string.max': 'Username cannot be more than 50 characters'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email',
            'string.empty': 'Email is required'
        }),
    phone: Joi.string()
        .required()
        .messages({
            'string.empty': 'Phone number is required'
        }),
    password: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.empty': 'Password is required'
        }),
    role: Joi.string()
        .valid('Admin', 'Seller', 'Buyer', 'Educator')
        .required()
        .messages({
            'any.only': 'Role must be either Admin, Seller, Buyer, or Educator'
        })
});

/**
 * Validation schema for user login
 * @type {Joi.ObjectSchema}
 */
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email',
            'string.empty': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required'
        })
});

/**
 * Validates user registration data
 * @param {Object} data - Registration data to validate
 * @throws {Error} If validation fails
 */
export const validateRegister = (data) => {
    const { error } = registerSchema.validate(data, { abortEarly: false });
    if (error) throw createHttpError(400, error.details[0].message);
};

/**
 * Validates user login data
 * @param {Object} data - Login data to validate
 * @throws {Error} If validation fails
 */
export const validateLogin = (data) => {
    const { error } = loginSchema.validate(data, { abortEarly: false });
    if (error) throw createHttpError(400, error.details[0].message);
};
