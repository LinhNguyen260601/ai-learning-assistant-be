import mongoose from "mongoose";
import { ENVIROMENTS } from "../constants";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENVIROMENTS.MONGO_URI!);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    error instanceof Error
      ? console.error(`Error connecting to MongoDB: ${error.message}`)
      : console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
