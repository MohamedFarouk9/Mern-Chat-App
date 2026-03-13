import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../config/constants.js";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateVerificationToken,
  generateResetToken,
  verifyToken,
} from "../utils/tokenUtil.js";

/* --------------------------------------------------------------------------
   registration
   - create user document (password will be hashed by pre-save hook)
   - send verification mail (unless OAuth)
   - respond with success message (no token yet)
   ------------------------------------------------------------------------- */

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // check unique constraints
    const existingUser =
      (await User.findByEmailOrUsername(email)) ||
      (await User.findByEmailOrUsername(username));

    if (existingUser) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .json({ success: false, message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS });
    }

    const user = new User.create({
      email,
      password,
      firstName,
      lastName,
      provider: "local",
    });

    const token = generateVerificationToken(user._id);
    await sendVerificationEmail(user.email, token);

    return res
      .status(HTTP_STATUS.CREATED)
      .json({ success: true, message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   login
   - find user by email/username
   - verify password
   - ensure email verified if local
   - issue access token
   ------------------------------------------------------------------------- */

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password"); // include password for verification

    if (!user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ success: false, message: ERROR_MESSAGES.INVALID_CREDENTIALS });
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ success: false, message: ERROR_MESSAGES.INVALID_CREDENTIALS });
    }

    if (!user.emailVerified) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ success: false, message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED });
    }

    const token = generateAccessToken(user._id, user.email);
    return res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   logout
   - simply return success; token will expire on client side
   ------------------------------------------------------------------------- */

export const logout = (req, res) => {
  return res.json({ success: true, message: SUCCESS_MESSAGES.LOGOUT_SUCCESS });
};

/* --------------------------------------------------------------------------
   verify email
   - decode token, mark user verified
   ------------------------------------------------------------------------- */

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    if (user.emailVerified) {
      return res.json({
        success: true,
        message: SUCCESS_MESSAGES.EMAIL_VERIFIED,
      });
    }

    user.emailVerified = true;
    user.verificationToken = undefined; // clear token
    user.verificationTokenExpiry = undefined; // clear expiry
    await user.save();

    return res.json({
      success: true,
      message: SUCCESS_MESSAGES.EMAIL_VERIFIED,
    });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   resend verification (optional auth)
   ------------------------------------------------------------------------- */
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    if (user.emailVerified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: true,
        message: SUCCESS_MESSAGES.EMAIL_ALREADY_VERIFIED,
      });
    }

    const token = generateVerificationToken(user._id);
    await sendVerificationEmail(user.email, token);
    return res.json({
      success: true,
      message: SUCCESS_MESSAGES.RESEND_VERIFICATION_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   forgot/reset password
   - forgot: generate reset token, send email
   - reset: verify token, update password
   ------------------------------------------------------------------------- */

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // respond success anyway to avoid enumeration
      return res.json({
        success: true, // don't reveal user existence
        message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
      });
    }

    const token = generateResetToken(user._id);
    await sendResetEmail(user.email, token);
    return res.json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (newPassword != confirmPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH,
      });
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select("+password");
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }
    user.password = newPassword; // will be hashed by pre-save hook
    await user.save();
    return res.json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------------------------
   Google OAuth
   - optional: verify token with Google API
   - find or create user, issue access token
   ------------------------------------------------------------------------- */
export const googleOAuth = async (req, res, next) => {
  try {
    const { googleToken } = req.body;
    // Optional: verify token with Google API here
    const payload = verifyGoogleToken(googleToken); // implement this function to call Google API

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        username: payload.email.split("@")[0], // simple username from email
        provider: "google",
        providerId: payload.sub, // Google's unique user ID
        emailVerified: true, // Google accounts are already verified
      });
    }

    const token = generateAccessToken(user._id, user.email);
    return res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
};
