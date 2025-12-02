import type { InferSchemaType, Types } from "mongoose";
import type { Flashcard } from "../models";
import type { Difficulty } from "./difficult.type";
import type mongoose from "mongoose";

export type FlashcardEntity = Omit<
  InferSchemaType<typeof Flashcard.schema>,
  "createdAt" | "updatedAt"
> & { _id: string | Types.ObjectId };

export interface CreateFlashcardDTO {
  userId: mongoose.Types.ObjectId;
  documentId: string;
  cards: {
    question: string;
    answer: string;
    difficulty: Difficulty;
    lastReviewed?: Date | null;
    reviewCount?: number;
    isStarred?: boolean;
  }[];
}
