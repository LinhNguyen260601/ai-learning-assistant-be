import { STATUS_CODES } from "../constants";
import { userRepository } from "../repositories";
import type { Response, UserDocument, UserEntity } from "../types";
import { excludePassword } from "../utils/excludePassword";
import { generateToken } from "../utils/token";

class AuthService {
  public register = async (
    payload: Pick<UserEntity, "username" | "email" | "password">
  ): Promise<
    Response<{ user: Omit<UserEntity, "password">; token: string }>
  > => {
    try {
      const userExists = await userRepository.findUser({
        email: payload.email,
      });
      if (userExists)
        return {
          success: false,
          message: "User already exists",
          statusCode: STATUS_CODES.BAD_REQUEST,
        };

      const user = await userRepository.createUser(payload);

      const token = generateToken(user._id);

      return {
        success: true,
        statusCode: STATUS_CODES.CREATED,
        message: "User created successfully",
        data: {
          user,
          token,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public login = async (
    payload: Pick<UserEntity, "email" | "password">
  ): Promise<
    Response<{ user: Omit<UserEntity, "password">; token: string }>
  > => {
    try {
      if (!payload.email || !payload.password) {
        return {
          success: false,
          message: "Email and password are required",
          statusCode: STATUS_CODES.BAD_REQUEST,
        };
      }

      const user = await userRepository.findUserWithPassword({
        email: payload.email,
      });

      if (!user) {
        return {
          success: false,
          message: "Invalid credentials",
          statusCode: STATUS_CODES.UNAUTHORIZED,
        };
      }

      const isMatch = await user.matchPassword?.(payload.password);

      if (!isMatch)
        return {
          success: false,
          message: "Invalid credentials",
          statusCode: STATUS_CODES.UNAUTHORIZED,
        };

      const token = generateToken(user._id);

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Login successful",
        data: {
          user: excludePassword(user),
          token,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public getMe = async (
    userId: string
  ): Promise<Response<{ user: Omit<UserEntity, "password"> }>> => {
    try {
      const user = await userRepository.findUser({ _id: userId });

      if (!user) {
        return {
          success: false,
          message: "User not found",
          statusCode: STATUS_CODES.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "User found",
        data: { user: excludePassword(user as UserDocument) },
      };
    } catch (error) {
      throw error;
    }
  };

  public updateMe = async (
    payload: Partial<UserEntity>,
    userId: string
  ): Promise<Response<{ user: Omit<UserEntity, "password"> }>> => {
    try {
      const { username, email, profileImage } = payload;
      const user = await userRepository.findUser({ _id: userId });
      if (!user) {
        return {
          success: false,
          message: "User not found",
          statusCode: STATUS_CODES.NOT_FOUND,
        };
      }

      const updatedUser = await userRepository.updateUser(
        userId,
        Object.assign(user, {
          ...(username && { username }),
          ...(email && { email }),
          ...(profileImage && { profileImage }),
        })
      );

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "User updated successfully",
        data: { user: updatedUser },
      };
    } catch (error) {
      throw error;
    }
  };
}

export default new AuthService();
