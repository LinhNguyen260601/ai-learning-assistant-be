import type { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "../constants";
import { User } from "../models";
import { verifyToken } from "../utils/token";

export const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = verifyToken(token);
      const user = await User.findById(decoded).select("-password");

      if (!user) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          statusCode: STATUS_CODES.UNAUTHORIZED,
          message: "Unauthorized",
        });
      }

      req.user = {
        ...user.toObject(),
        _id: user._id.toString(),
      };

      next();
    } catch (error: unknown) {
      const appError = error as Error;
      console.error("Auth middleware error", appError.message);

      if (appError.name === "TokenExpiredError") {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          statusCode: STATUS_CODES.UNAUTHORIZED,
          message: "Token expired",
        });
      }
    }

    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Not authorized, token failed",
    });
  }

  if (!token) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Not authorized, no token",
    });
  }
};
