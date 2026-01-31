// JWT Token Utility - Factory Pattern
// Creates and verifies JWT tokens for authentication
// Handles access tokens, verification tokens, and reset tokens

import jwt from "jsonwebtoken";
import logger from "./logger";

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = "15m"; // Access tokens expire in 15 minutes
const VERIFICATION_TOKEN_EXPIRY = "1d"; // Verification tokens expire in 1 day
const RESET_TOKEN_EXPIRY = "1h"; // Reset tokens expire in 1 hour

/**
 * Generate JWT Access Token
 * Used after successful login/registration
 * @param {string} userId - MongoDB user _id
 * @param {string} email - User email
 * @returns {string} JWT token
 */

export const generateAccessToken = (userId, email) => {
  try {
    const token = jwt.sign(
      {
        userId,
        email,
        type: "access",
      },
      JWT_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY,
        issuer: "my-chat-app",
        audience: "web",
      },
    );

    logger.debug("Access token generated", { userId });
    return token;
  } catch (error) {
    logger.error("Failed to generate access token", error);
    throw new Error("Token generation failed");
  }
};

/**
 * Generate Email Verification Token
 * Used in email verification link
 * @param {string} userId - MongoDB user _id
 * @returns {string} Verification token
 */
export const generateVerificationToken = (userId) => {
  try {
    const token = jwt.sign(
      {
        userId,
        type: "verification",
      },
      JWT_SECRET,
      {
        expiresIn: VERIFICATION_TOKEN_EXPIRY,
      },
    );
    logger.debug("Verification token generated", { userId });
    return token;
  } catch (error) {
    logger.error("Failed to generate verification token", error);
    throw new Error("Verification token generation failed");
  }
};

/**
 * Generate Password Reset Token
 * Used for password reset functionality
 * @param {string} userId - MongoDB user _id
 * @returns {string} Reset token
 */

export const generateResetToken = (userId) => {
    try{
        const token = jwt.sign(
            {
                userId,
                type: "reset",
            },
            JWT_SECRET,
            {
                expiresIn: RESET_TOKEN_EXPIRY,
            }
        );

        logger.debug('Reset token generated', { userId });
        return token;
    } catch (error) {
        logger.error('Failed to generate reset token', error);
        throw new Error('Reset token generation failed');
    }
};


/**
 * Verify JWT Token
 * Checks if token is valid and not expired
 * @param {string} token - Token to verify
 * @returns {object} Decoded token payload { userId, email, type, iat, exp }
 * @throws {Error} If token is invalid or expired
 */

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token , JWT_SECRET);
        logger.debug('Token Verfied', { userId: decoded.userId});
        return decoded;
    } catch (error) {
        if(error.name === 'TokenExpiredError') {
            logger.warn('Token expired', { message: error.message });
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            logger.warn('Invalid token', { message: error.message });
            throw new Error('Invalid token');
        } else {
            logger.error('Token verification error', error);
            throw error;
        }
    }
};


/**
 * Extract token from Authorization header
 * Expected format: "Bearer <token>"
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if invalid format
 */
export const extractTokenFromHeader = (authHeader) => {
    if (!authHeader){
        return null;
    }
    const parts = authHeader.split(' ');

    // Validate header format
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        logger.warn('Invalid Authorization header format', { authHeader });
        return null;
    }
    return parts[1];
}


/**
 * Decode token without verification
 * ⚠️ SECURITY WARNING: Only for debugging/logging
 * Do NOT use for authentication decisions
 * @param {string} token - Token to decode
 * @returns {object|null} Decoded payload or null if invalid
 */

export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        logger.error('Failed to decode token', error);
        return null;
    }
}

/**
 * Get token expiry time in seconds
 * @param {string} token - JWT token
 * @returns {number} Seconds until expiry
 */
export const getTokenExpiry = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return null;

        const expiryTime = decoded.exp * 1000; //Convert to milliseconds
        const now = Date.now();
        return Math.round((expiryTime - now) / 1000); // Return seconds until expiry
    } catch (error) {
        return null;
    }
};


// Client → POST /login
// Server → validates user
// Server → creates JWT
// Client → stores JWT
// Client → sends JWT with every request
// Server → verifies JWT