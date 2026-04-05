import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import logger from "../utils/logger.js";

const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "chat-app-uploads",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

// Create upload middleware
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/* --------------------------------------------------------------------------
   upload profile image
   -------------------------------------------------------------------------- */
export const uploadProfileImage = (req, res, next) => {
  upload.single("profileImage")(req, res, (err) => {
    if (err) {
      logger.error("Upload error", err);
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    req.uploadedImageUrl = req.file.path; // Cloudinary URL
    next();
  });
};

/* --------------------------------------------------------------------------
   upload message attachments (images, files)
   -------------------------------------------------------------------------- */
export const uploadMessageAttachment = (req, res, next) => {
  upload.single("attachment")(req, res, (err) => {
    if (err) {
      logger.error("Upload error", err);
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    req.uploadedFileUrl = req.file.path;
    req.uploadedFileName = req.file.originalname;
    next();
  });
};

/* --------------------------------------------------------------------------
   delete file from Cloudinary
   -------------------------------------------------------------------------- */
export const deleteFile = async (publicId) => {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
    logger.info("File deleted from Cloudinary", { publicId });
  } catch (error) {
    logger.error("Error deleting file", error);
    throw error;
  }
};
