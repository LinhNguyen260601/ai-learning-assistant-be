import type { InferSchemaType, Types } from "mongoose";
import type { Quiz } from "../models";
import type mongoose from "mongoose";
import type { Difficulty } from "./difficult.type";

export type QuizEntity = Omit<
  InferSchemaType<typeof Quiz.schema>,
  "createdAt" | "updatedAt"
> & { _id: string | Types.ObjectId };

export interface CreateQuizDTO {
  userId: mongoose.Types.ObjectId;
  documentId: string;
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: Difficulty;
  }[];
  userAnswers: {
    questionIndex: number;
    selectedAnswer: string;
    isCorrect?: boolean;
    answeredAt?: Date;
  }[];
  score: number;
  totalQuestions: number;
}
