import { STATUS_CODES } from "../constants";
import { userRepository } from "../repositories";
import type { Response, UserEntity } from "../types";
import { generateToken } from "../utils/token";

class AuthService {
  public register = async (
    payload: Pick<UserEntity, "username" | "email" | "password">
  ): Promise<Response<{ user: UserEntity; token: string }>> => {
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
}

export default new AuthService();
