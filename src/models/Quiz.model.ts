import { model, Schema } from "mongoose";
import { Difficulty } from "../types";

const quizSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    documentId: {
      type: String,
      required: [true, "Document ID is required"],
      trim: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: [true, "Question is required"],
        },
        options: {
          type: [String],
          required: [true, "Options are required"],
          validate: [
            (array: string[]) => array.length === 4,
            "Options must be exactly 4",
          ],
        },
        correctAnswer: {
          type: String,
          required: [true, "Correct answer is required"],
        },
        explanation: {
          type: String,
          default: "",
        },
        difficulty: {
          type: String,
          enum: [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD],
          default: Difficulty.MEDIUM,
        },
      },
    ],
    userAnswers: [
      {
        questionIndex: {
          type: Number,
          required: [true, "Question index is required"],
        },
        selectedAnswer: {
          type: String,
          required: [true, "Selected answer is required"],
        },
        isCorrect: {
          type: Boolean,
          default: true,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: [true, "Total questions is required"],
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = model("Quiz", quizSchema);

export default Quiz;
