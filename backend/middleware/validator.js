// Request Validation Middleware
// Validates request body, params, and query using Joi schemas
// Returns 400 Bad Request if validation fails

import { validate } from '../utils/validators.js';
import { HTTP_STATUS } from '../config/constants.js';
import logger from '../utils/logger.js';
import {
  registrationSchema,
  loginSchema,
  googleAuthSchema,
  emailVerificationSchema,
  emailVerificationMockSchema,
  sendMessageSchema,
  searchUsersSchema,
  updateProfileSchema
} from '../utils/validators.js';

/**
 * Generic validation middleware factory
 * Creates middleware that validates against a Joi schema
 * 
 * Usage:
 * router.post('/register', validateRequest(registerSchema), authController.register)
 * 
 * @param {object} schema - Joi validation schema
 * @param {string} source - 'body' (default), 'params', or 'query'
 */
export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      // Get data from specified source
      const data = req[source];

      // Validate data
      const { error, value } = validate(data, schema);

      if (error) {
        logger.warn(`Validation error on ${source}`, error);
        
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: error,
        });
      }

      // Replace original data with validated/sanitized data
      req[source] = value;
      next();
    } catch (error) {
      logger.error('Validation middleware error', error);
      
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Validation error occurred',
      });
    }
  };
};

/**
 * Validation middleware for registration
 */
export const validateRegister = validateRequest(registrationSchema, 'body');

/**
 * Validation middleware for login
 */
export const validateLogin = validateRequest(loginSchema, 'body');

/**
 * Validation middleware for Google OAuth
 */
export const validateGoogleAuth = validateRequest(googleAuthSchema, 'body');

/**
 * Validation middleware for email verification
 */
export const validateEmailVerification = validateRequest(
  emailVerificationSchema,
  'query'
);

/**
 * Validation middleware for email verification mock
 */
export const validateEmailVerificationMock = validateRequest(
  emailVerificationMockSchema,
  'body'
);

/**
 * Validation middleware for sending message
 */
export const validateSendMessage = validateRequest(sendMessageSchema, 'body');

/**
 * Validation middleware for user search
 */
export const validateSearchUsers = validateRequest(searchUsersSchema, 'query');

/**
 * Validation middleware for profile update
 */
export const validateUpdateProfile = validateRequest(updateProfileSchema, 'body');