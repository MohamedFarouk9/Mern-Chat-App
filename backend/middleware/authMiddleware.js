// Authentication Middleware
// Verifies JWT token on protected routes
// Attaches user info to request object for controllers to use

import { ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";
import logger from "../utils/logger.js";
import { extractTokenFromHeader, verifyToken } from "../utils/tokenUtil.js";

/**
 * Middleware: Verify JWT token
 * Used on protected routes to ensure user is authenticated
 *
 * Flow:
 * 1. Extract token from "Authorization: Bearer <token>" header
 * 2. Verify token signature and expiry
 * 3. If valid → attach user to req.user, call next()
 * 4. If invalid → return 401 Unauthorized
 */

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn("Missing Authorization header");
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    // Extract token from "Bearer <token>" format
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      logger.warn("Invalid Authorization header format");
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Invalid authorization format. Use: Bearer <token>",
      });
    }
    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request for use in controllers
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      type: decoded.type,
    };

    logger.info("User authenticated", { userId: decoded.userId });
    next(); // Proceed to next middleware/controller
  } catch (error) {
    logger.error("Authentication error", error);

    // Different error messages for different scenarios
    if (error.message === "Token has expired") {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
      });
    }

    if (error.message === "invalid token") {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
      });
    }

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  }
};

/**
 * Optional: Only verify token if provided
 * Used on routes that work both authenticated and unauthenticated
 */

export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = extractTokenFromHeader(authHeader);

      if (token) {
        const decoded = verifyToken(token);

        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          type: decoded.type,
        };
        logger.info("User authenticated (optional)", {
          userId: decoded.userId,
        });
      }
    }
    // Always proceed, even if no token or invalid token
    next();
  } catch (error) {
    // Silently continue, user is not authenticated but endpoint allows it
    next();
  }
};
