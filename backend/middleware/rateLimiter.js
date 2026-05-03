// Rate Limiter Middleware
// Prevents brute force attacks on sensitive endpoints
// Limits requests from same IP within time window

import rateLimit from "express-rate-limit";
import { RATE_LIMIT } from "../config/constants.js";
import logger from "../utils/logger.js";



/**
 * Auth endpoints rate limiter
 * 5 requests per 15 minutes per IP
 */

export const authLimiter = rateLimit({
    windowMs: RATE_LIMIT.AUTH_LIMIT.windowMs, // 15 minutes
    max: RATE_LIMIT.AUTH_LIMIT.max, // limit each IP to 5 requests per windowMs
    message: RATE_LIMIT.AUTH_LIMIT.message,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Don't apply rate limit in test environment
        return process.env.NODE_ENV === "test";
    },
    keyGenerator: (req) => {
        // Use client IP for rate limiting key
        return req.ip || req.connection.remoteAddress;
    },
    handler: (req , res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: RATE_LIMIT.AUTH_LIMIT.message,
            retryAfter: req.rateLimit.resetTime,
        });
    },
});

/**
 * General endpoints rate limiter
 * 100 requests per 1 minute per IP
 */

export const generalLimiter = rateLimit({
    windowMs: RATE_LIMIT.GENERAL_LIMIT.windowMs, // 1 minute
    max: RATE_LIMIT.GENERAL_LIMIT.max, // 100 requests
    message: RATE_LIMIT.GENERAL_LIMIT.message,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return process.env.NODE_ENV === "test";
    },
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress;
    },
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: RATE_LIMIT.GENERAL_LIMIT.message,
            retryAfter: req.rateLimit.resetTime,
        });
    },
});

/**
 * Strict rate limiter for message sending
 * Prevents message spam
 */
export const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 messages per windowMs
    message: "Too many messages sent from this IP, please try again after a minute",
    standardHeaders: true,
    legacyHeaders: false,
});

export default { authLimiter, generalLimiter, messageLimiter };