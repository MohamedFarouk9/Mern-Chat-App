// Singleton Pattern Implementation
// Ensures only ONE MongoDB connection exists throughout app lifetime
// Prevents memory leaks from duplicate connections

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

let isConnected = false; // Track connection status

const connectDB = async () => {
    // Check if already connected (Singleton principle)
    if (isConnected) {
        logger.info('Using existing MongoDB connection');
        return mongoose.connection;
    }

    try {
        const {MONGO_URI , NODE_ENV} = process.env;

        if(!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        logger.info(`Connecting to MongoDB in ${NODE_ENV} mode...`);

        const conn = await mongoose.connect(MONGO_URI, {
            dbName: 'myDatabase', // specify your database name
        });


        isConnected = true; // Update connection status
        logger.info(`✅ MongoDB connected successfully on ${conn.connection.host}`);

        // Handle connection events after initial connection
        mongoose.connection.on("disconnected", () => {
            logger.warn("⚠️ MongoDB disconnected!");
            isConnected = false;
        });

        mongoose.connection.on("error", (err)=> {
            logger.error(`❌ MongoDB connection error: ${err}`);
            isConnected = false;
        });

        return conn;
    } catch (error){
        logger.error(`❌ MongoDB connection failed: ${error.message}`);
        // Retry connection after 5 seconds
        setTimeout(() => connectDB(), 5000);
        throw error; // Rethrow to handle it further up if needed
    }

};

export default connectDB;