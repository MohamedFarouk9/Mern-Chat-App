// Central place for all constants used throughout the app
// Makes it easy to update values in one place
// DRY Principle: No magic strings in code  

export const USER_STATUSES = {
  ONLINE: "online",
  OFFLINE: "offline",
  AWAY: "away",
};

export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  FILE: "file",
};

export const MESSAGE_STATUSES = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
};

export const ERROR_MESSAGES = {
  INVALID_EMAIL: "Please provide a valid email address",
  WEAK_PASSWORD:"Password must be at least 8 characters with uppercase, lowercase, and number",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_ALREADY_EXISTS: "Email already registered",
  USERNAME_ALREADY_EXISTS: "Username already taken",
  TOKEN_EXPIRED: "Token has expired",
  INVALID_TOKEN: "Invalid token",
  UNAUTHORIZED: "You are not authorized to perform this action",
  SERVER_ERROR: "An error occurred on the server. Please try again.",
  EMAIL_NOT_VERIFIED: "Please verify your email before logging in",
  INVALID_GOOGLE_TOKEN: "Invalid Google token",
  PASSWORDS_DO_NOT_MATCH: "New password and confirm password do not match",
  FILE_TOO_LARGE: "File size must be less than 5MB",
};


export const SUCCESS_MESSAGES = {
    REGISTRATION_SUCCESS: "Registration successful! Please check your email to verify your account.",
    EMAIL_VERIFIED: "Email verified successfully! You can now log in.",
    LOGIN_SUCCESS: "Login successful! Welcome back.",
    RESEND_VERIFICATION_SUCCESS: "Verification email resent! Please check your inbox.",
    LOGOUT_SUCCESS: "You have been logged out successfully.",
    EMAIL_ALREADY_VERIFIED: "Email is already verified. You can log in.",
    PASSWORD_RESET_EMAIL_SENT: "Password reset email sent! Please check your inbox.",
    PASSWORD_RESET_SUCCESS: "Password has been reset successfully! You can now log in with your new password.",
}

export const VALIDATION_RULES = {
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 30,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MAX_MESSAGE_LENGTH: 5000,
    MAX_FILE_SIZE_MB: 5 * 1024 * 1024, // 5MB in bytes
    TOKEN_EXPIRY: '7d', // 7 days
    VERIFICATION_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds 
}

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};

export const RATE_LIMIT = {
    AUTH_LIMIT: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // limit each IP to 10 requests per windowMs
        message: "Too many authentication attempts from this IP, please try again after 15 minutes",
    },
    GENERAL_LIMIT: {
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 100, // limit each IP to 100 requests per windowMs
        message: "Too many requests from this IP, please try again after a minute",
    },
};

export const API_ENDPOINTS = {
    AUTH: '/api/auth',
    USER: '/api/user',
    MESSAGE: '/api/message',
    FRIEND: '/api/friend',
    NOTIFICATION: '/api/notification',
};

export const SOCKET_EVENTS = {
    // Connection events
    CONNECT: "connect",
    DISCONNECT: "disconnect",

    // User status events
    USER_ONLINE: "user:online",
    USER_OFFLINE: "user:offline",
    USER_STATUS_CHANGED: "user:status-changed",

    // Messaging events
    MESSAGE_SEND: "message:send",
    MESSAGE_RECEIVE: "message:receive",
    MESSAGE_DELIVERED: "message:delivered",
    MESSAGE_READ: "message:read",

    // Typing events
    USER_TYPING: "user:typing",
    USER_STOPPED_TYPING: "user:stopped-typing",

    // Notification events
    NOTIFICATION_NEW: "notification:new",
    NOTIFICATION_READ: "notification:read",


}
