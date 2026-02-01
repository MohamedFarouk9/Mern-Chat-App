// Joi Validation Schemas
// Centralized request validation schemas
// Prevents invalid data from entering the system

import Joi, { optional } from "joi";

const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
  username: /^[a-zA-Z0-9_-]+$/,
  url: /^https?:\/\/.+/,
};

/**
 * Registration validation schema
 * Validates: email, password, firstName, lastName, username
 */

export const registrationSchema = Joi.object({
  email: Joi.string().required().lowercase().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),

  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(patterns.password)
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)",
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password must not exceed 128 characters",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm Password is required",
  }),

  firstName: Joi.string().max(50).required().messages({
    "string.max": "First name must not exceed 50 characters",
    "any.required": "First name is required",
  }),

  lastName: Joi.string().max(50).required().messages({
    "string.max": "Last name must not exceed 50 characters",
    "any.required": "Last name is required",
  }),

  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .pattern(patterns.username)
    .messages({
      "string.pattern.base":
        "Username can only contain letters, numbers, underscores, and dashes",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username must not exceed 30 characters",
      "any.required": "Username is required",
    }),
}).strict(); // Don't allow extra fields

/**
 * Login validation schema
 * Validates: email, password
 */

export const loginSchema = Joi.object({
  email: Joi.string().required().lowercase().messages({
    "any.required": "Email is required",
    "string.email": "Please provide a valid email",
  }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
}).strict(); // No extra fields

/**
 * Google OAuth validation schema
 */
export const googleAuthSchema = Joi.object({
  googleToken: Joi.string().required().messages({
    "any.required": "Google token is required",
  }),
}).strict(); // No fields expected

/**
 * Email verification schema
 */

export const emailVerificationSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Verification token is required",
  }),
}).strict();

/**
 * Mock email verification (for testing)
 */

export const emailVerificationMockSchema = Joi.object({
  email: Joi.string().required().lowercase().messages({
    "any.required": "Email is required",
    "string.email": "Please provide a valid email",
  }),
}).strict();

/**
 * Send message validation schema
 */

export const sendMessageSchema = Joi.object({
  receiverId: Joi.string().messages({
    "any.required": "Receiver ID is required",
  }),

  content: Joi.string().max(5000).required().messages({
    "any.required": "Message content is required",
    "string.max": "Message content must not exceed 5000 characters",
  }),

  messageType: Joi.string()
    .valid("text", "image", "emoji", "file")
    .default("text"),

  imageUrl: Joi.string().url().optional(),
}).strict();

/**
 * Update user profile validation
 */

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  profileImage: Joi.string(),
}).strict();

/**
 * Search users validation
 */

export const searchUsersSchema = Joi.object({
  query: Joi.string().min(1).max(100).required().messages({
    "any.required": "Search query is required",
  }),

  limit: Joi.number().default(1).min(1),
  page: Joi.number().default(1).min(1),
}).strict();

/**
 * Generic validation function
 * @param {object} data - Data to validate
 * @param {object} schema - Joi schema to validate against
 * @returns {object} { error: details[], value: object }
 */
export const validate = (data, schema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false, // Show all errors, not just first
    stripUnknown: true, // Remove unknown properties
  });

  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return { error: null, value };
  }
};
