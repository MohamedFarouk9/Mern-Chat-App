// Global Error Handler Middleware
// Catches all errors from routes and controllers
// Formats error responses consistently
// Must be registered LAST in middleware stack

import { HTTP_STATUS } from "../config/constants.js";
import logger from "../utils/logger.js";

/**
 * Custom AppError class for consistent error handling
 */

export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // To distinguish operational errors from programming errors
  }
}

/**
 * Global Error Handler Middleware
 * Must be last middleware in app.js
 *
 * Catches:
 * - Validation errors (400)
 * - Authentication errors (401)
 * - Authorization errors (403)
 * - Not found errors (404)
 * - Duplicate key errors (409)
 * - Server errors (500)
 */

export const errorHandler = (err, req, res, next) => {
  //Set default values
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.message = err.message || "Internal Server Error";

  // Log error for debugging
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  // MongoDB Cast Error (invalid ObjectId)
  if (err.name === "CastError") {
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    err.message = "Invalid ID format";
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.statusCode = HTTP_STATUS.CONFLICT;
    err.message = `${field} already exists`;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    err.statusCode = HTTP_STATUS.UNAUTHORIZED;
    err.message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    err.statusCode = HTTP_STATUS.UNAUTHORIZED;
    err.message = "Token expired";
  }

  // Validation Error
  if (err.name === "ValidationError") {
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    err.message = messages;
  }
  // Send error response
  const response = {
    success: false,
    message: err.message,
    statusCode: err.statusCode,
  };

  // Include error details only in development

  if (process.env.NODE_ENV === "development") {
    response.error = {
      stack: err.stack,
      name: err.name,
    };
  }
  res.status(err.statusCode).json(response);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not Found Middleware
 * Catches 404 requests (must be registered after all routes)
 */

export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND,
  );
  next(error);
};
