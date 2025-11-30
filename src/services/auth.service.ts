import { STATUS_CODES } from "../constants";
import { userRepository } from "../repositories";
import type { Response, UserEntity } from "../types";
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

      const isMatch = await user.matchPassword(payload.password);

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
}

export default new AuthService();
