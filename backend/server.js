import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import rateLimiter from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";
import { initSocket } from "./socket/index.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import messageRoutes from "./routes/message.js";
import notificationRoutes from "./routes/notification.js";
import friendRoutes from "./routes/friend.js";

// Load environment variables FIRST before any other code
dotenv.config();

const app = express();
const server = http.createServer(app);

// connect to MongoDB
await connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(rateLimiter.general);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/friend", friendRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handling
app.use(errorHandler);

// Initialize Socket.IO
const io = initSocket(server);
app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});