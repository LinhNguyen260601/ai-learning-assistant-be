import type { InferSchemaType, Types } from "mongoose";
import type { Quiz } from "../models";

export type QuizEntity = Omit<
  InferSchemaType<typeof Quiz.schema>,
  "createdAt" | "updatedAt"
> & { _id: string | Types.ObjectId };
