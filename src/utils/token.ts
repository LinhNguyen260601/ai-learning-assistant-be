import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import type { Types } from "mongoose";
import { ENVIRONMENTS } from "../constants";

/**
 *
 * @param id - The id of the user
 * @param expiresIn - The expiration time of the token
 * @returns The generated token
 */
export const generateToken = (
  id: string | Types.ObjectId,
  expiresIn = ENVIRONMENTS.JWT_EXPIRES_IN
): string =>
  jwt.sign({ id }, ENVIRONMENTS.JWT_SECRET as string, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });

/**
 * Verify a JWT token
 * @param token - The token to verify
 * @returns The user ID from the token payload
 * @throws Error if the token is invalid or expired
 */
export const verifyToken = (token: string): string | Types.ObjectId => {
  const decoded = jwt.verify(
    token,
    ENVIRONMENTS.JWT_SECRET as string
  ) as JwtPayload & { id: string | Types.ObjectId };
  return decoded.id;
};
