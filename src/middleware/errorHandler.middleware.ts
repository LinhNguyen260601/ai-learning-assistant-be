import type { Request, Response, NextFunction } from "express";
import { ENVIRONMENTS, STATUS_CODES } from "../constants";
import type { AppError } from "../types";

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    message = "Resource not found";
    statusCode = STATUS_CODES.NOT_FOUND;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field} already exists`;
    statusCode = STATUS_CODES.BAD_REQUEST;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors || {})
      .map((error) => error.message)
      .join(", ");
    statusCode = STATUS_CODES.BAD_REQUEST;
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "File size is too large";
    statusCode = STATUS_CODES.BAD_REQUEST;
  }

  // JWT authentication error
  if (err.name === "JsonWebTokenError") {
    message = "Unauthorized";
    statusCode = STATUS_CODES.UNAUTHORIZED;
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    message = "Token expired";
    statusCode = STATUS_CODES.UNAUTHORIZED;
  }

  console.error("Error", {
    message: err.message,
    stack: ENVIRONMENTS.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...(ENVIRONMENTS.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFoundHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(STATUS_CODES.NOT_FOUND).json({
    success: false,
    status: STATUS_CODES.NOT_FOUND,
    message: "Route not found",
  });
};
