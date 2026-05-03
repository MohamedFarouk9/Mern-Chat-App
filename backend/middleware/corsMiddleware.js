// CORS Middleware Configuration
// Controls which domains can access the API
// Prevents requests from unauthorized origins

import logger from "../utils/logger.js";

/**
 * CORS Configuration
 * Specifies which origins are allowed to access the API
 */

const corsOptions = {
  // Allow requests from React app
  origin: function (origin, callback) {
    const ALLOWED_ORIGINS = [
      "http://localhost:3000", // Local development
      "http://localhost:5173", // Vite/react development
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      // Add production URLs here later
      // 'https://yourdomain.com'
    ];

    // Allow requests with no origin (mobile apps, curl requests, etc)
    if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },

  // Allow these HTTP methods
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  // Allow these headers
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],

  // Allow credentials (cookies, auth headers)
  credentials: true,

  // Cache CORS pre-flight requests for 1 hour
  maxAge: 3600,

  // For preflight requests
  optionsSuccessStatus: 200,
};

/**
 * Apply CORS middleware
 * Usage in app.js: app.use(corsMiddleware())
 */

export const corsMiddleware = () => {
  logger.info("CORS middleware initialized");
  return cors(corsOptions);
};

/**
 * Environment-aware CORS configuration
 * More restrictive in production
 */
export const getCorsConfig = () => {
  if (process.env.NODE_ENV === "production") {
    return {
      ...corsOptions,
      origin: process.env.FRONTEND_URL || "https://yourdomain.com",
    };
  }
  return corsOptions;
};
