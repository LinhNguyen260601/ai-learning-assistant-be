import { model, Schema } from "mongoose";
import { Difficulty } from "../types";

const flashcardSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    documentId: {
      type: String,
      required: [true, "Document ID is required"],
    },
    cards: [
      {
        question: {
          type: String,
          required: [true, "Question is required"],
        },
        answer: {
          type: String,
          required: [true, "Answer is required"],
        },
        difficulty: {
          type: String,
          enum: [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD],
          default: Difficulty.MEDIUM,
        },
        lastReviewed: {
          type: Date,
          default: null,
        },
        reviewCount: {
          type: Number,
          default: 0,
        },
        isStarred: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

flashcardSchema.index({ userId: 1, documentId: 1 });

const Flashcard = model("Flashcard", flashcardSchema);

export default Flashcard;
