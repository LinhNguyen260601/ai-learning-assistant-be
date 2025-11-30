import type { Document } from "mongoose";
import type { UserDocument } from "../types";

/**
 * Exclude the password from the user document
 * @param user - The user document
 * @returns The user document without the password
 */
export const excludePassword = (
  user: Document
): Omit<UserDocument, "password"> => {
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};
