import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error("WARNING: MONGODB_URI is not defined in environment variables.");
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connect DB");
  } catch (error) {
    console.error(" MongoDB connection error:", error);
    // Remove process.exit(1) to avoid crashing the serverless function
  }
}

export default connectDB;