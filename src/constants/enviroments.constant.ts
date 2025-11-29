import dotenv from "dotenv";
dotenv.config();

export const ENVIROMENTS = {
  PORT: process.env.PORT || 6969,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
} as const;
