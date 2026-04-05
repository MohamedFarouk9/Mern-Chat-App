import nodemailer from "nodemailer";

const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_MODE, EMAIL_URL } = process.env;

let transporter;
if (EMAIL_MODE === "real") {
  // Create transporter for real email sending
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
} else {
  // Create transporter for testing (logs emails to console)
  transporter = {
    sendMail: async (mailOptions) => {
      logger.info("📧 Mock email sent", mailOptions);
      return { messageId: "mock-" + Date.now() };
    },
  };
}

/* --------------------------------------------------------------------------
   send verification email
   -------------------------------------------------------------------------- */
export const sendVerificationEmail = async (email, token) => {
  try {
    const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Verify your email address",
      html: `<p>Thank you for registering! Please click the link below to verify your email address:</p>
             <a href="${verificationLink}">Verify Email</a>
             <p>This link will expire in 24 hours.</p>`,
    };

    await transporter.sendMail(mailOptions);
    logger.info("Verification email sent", { email });
  } catch (error) {
    logger.error("Failed to send verification email", { email, error });
    throw new Error("Failed to send verification email");
  }
};

/* --------------------------------------------------------------------------
   send password reset email
   -------------------------------------------------------------------------- */
export const sendResetEmail = async (email, token) => {
  try {
    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>Link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info("Password reset email sent", { email });
  } catch (error) {
    logger.error("Failed to send password reset email", { email, error });
    throw new Error("Failed to send password reset email");
  }
};

/* --------------------------------------------------------------------------
   send notification email (optional: batched digest)
   -------------------------------------------------------------------------- */
export const sendNotificationEmail = async (email, notifications) => {
  try {
    // Build email content based on notifications
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "You have new notifications",
      html: `
        <h2>You have a new notification</h2>
        <p>${notification.message || "Check your chat app for details."}</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    logger.info("Notification email sent", { email });
  } catch (error) {
    logger.error("Failed to send notification email", { email, error });
    throw new Error("Failed to send notification email");
  }
};
