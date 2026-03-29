import express from "express";
import http from "http";
import cors from "cors";
import rateLimiter from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

import connectDB from "./config/db";
import logger from "./utils/logger.js";

const app = express();
const server = http.createServer(app);

// connect to MongoDB
await connectDB();

// Middleware
app.use(cors());
// increase payload limit for profile images (up to 10MB, adjust as needed)
app.use(express.json({ limit: "10mb" }));
// for parsing application/x-www-form-urlencoded data (e.g., from forms)
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(rateLimiter.general);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handling
app.use(errorHandler);

const io = initSocket(server); // Initialize Socket.IO
app.set("io", io); // make io accessible in routes/controllers via req.app.get('io')

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});