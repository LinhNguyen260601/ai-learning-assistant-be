import type { InferSchemaType, Types } from "mongoose";
import type { User } from "../models";

export type UserEntity = Omit<
  InferSchemaType<typeof User.schema>,
  "createdAt" | "updatedAt"
> & { _id: string | Types.ObjectId };
