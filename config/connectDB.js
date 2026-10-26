import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.error("WARNING: MONGODB_URI is not defined in environment variables.");
    return null;
  }

  // If already connected, return immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection is in progress, await the existing connection promise
  if (mongoose.connection.readyState === 2 && cached.promise) {
    return await cached.promise;
  }

  // If disconnected or connection was never initiated, reset cache and connect
  if (mongoose.connection.readyState === 0 || !cached.promise) {
    cached.promise = null;
    cached.conn = null;

    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("MongoDB connection established successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        console.error("MongoDB connection error:", err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;