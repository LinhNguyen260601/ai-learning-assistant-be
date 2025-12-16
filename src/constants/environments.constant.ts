import dotenv from "dotenv";
dotenv.config();

export const ENVIRONMENTS = {
  PORT: process.env.PORT || 6969,

  NODE_ENV: process.env.NODE_ENV || "development",

  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE!) || 10485760,

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
} as const;
