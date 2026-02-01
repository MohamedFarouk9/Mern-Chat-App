// Password Hashing Utility
// Uses bcryptjs for secure password hashing
// Passwords are never stored in plaintext

import bcrypt from "bcryptjs";
import logger from "./logger.js";

const SALT_ROUNDS = 10; // Security vs performance tradeoff (10-12 is recommended)

/**
 * Hash a plaintext password
 * Uses bcryptjs with salt rounds
 * @param {string} password - Plaintext password to hash
 * @returns {Promise<string>} Hashed password (can never be reversed)
 * @throws {Error} If password is invalid or hashing fails
 */

export const hashPassword = async (password) => {
  try {
    // Validate password
    if (!password || typeof password !== "string") {
      throw new Error("Invalid password format");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    //hash with bcryptjs (async operation)
    const salt = await bcrypt.getSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    logger.debug("Password hashed successfully");
    return hashedPassword;
  } catch (error) {
    logger.error("Password hashing failed", error);
    throw new Error("Password hashing failed");
  }
};

/**
 * Compare plaintext password with hashed password
 * Used during login to verify password
 * @param {string} plainPassword - Plaintext password from user login
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if match, false otherwise
 * @throws {Error} If comparison fails
 */

export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    if (!plainPassword || !hashedPassword) {
      throw new Error("Missing password or hash");
    }

    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    logger.debug("Password comparison completed", { isMatch });
    return isMatch;
  } catch (error) {
    logger.error("Password comparison failed", error);
    throw new Error("Password comparison failed");
  }
};

/**
 * Generate random token string
 * Used for email verification tokens, password reset tokens
 * @returns {string} Random 32-character token
 */

export const generateRandomToken = () => {
  //   const token =
  //     Math.random().toString(36).substring(2, 15) +
  //     Math.random().toString(36).substring(2, 15);
  //     Math.random().toString(36).substring(2, 15);
  const token = crypto.randomBytes(16).toString("hex"); // 32 chars
  logger.debug("Random token generated");
  return token;
};

/**
 * Check if password needs rehashing (for security updates)
 * @param {string} hashedPassword - Current hashed password
 * @returns {boolean} True if should be rehashed
 */
export const shouldRehashPassword = (hashedPassword) => {
  try {
    // bcryptjs passwords start with $2a$, $2b$, or $2y$
    // Check if using modern algorithm version
    return !hashedPassword.startsWith("$2y$");
  } catch (error) {
    return false;
  }
};
