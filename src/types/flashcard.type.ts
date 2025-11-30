import type { InferSchemaType, Types } from "mongoose";
import type { Flashcard } from "../models";

export type FlashcardEntity = Omit<
  InferSchemaType<typeof Flashcard.schema>,
  "createdAt" | "updatedAt"
> & { _id: string | Types.ObjectId };
