import mongoose from "mongoose";
import { Flashcard } from "../models";
import type { FlashcardEntity, Response } from "../types";
import { STATUS_CODES } from "../constants";

class FlashcardRepository {
  public deleteFlashcard = async (
    id: string,
    userId: string
  ): Promise<Response<FlashcardEntity>> => {
    const updatedFlashCardSet = await Flashcard.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!updatedFlashCardSet) {
      return {
        success: false,
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Flashcard not found",
      };
    }

    return {
      success: true,
      statusCode: STATUS_CODES.OK,
      message: "Flashcard deleted successfully",
    };
  };

  public toggleStarFlashcard = async (
    cardId: string,
    userId: string
  ): Promise<Response<FlashcardEntity>> => {
    const updatedFlashCardSet = await Flashcard.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        "cards._id": new mongoose.Types.ObjectId(cardId),
      },
      [
        {
          $set: {
            cards: {
              $map: {
                input: "$cards",
                as: "card",
                in: {
                  $cond: {
                    if: {
                      $eq: ["$$card._id", new mongoose.Types.ObjectId(cardId)],
                    },
                    then: {
                      $mergeObjects: [
                        "$$card",
                        { isStarred: { $not: "$$card.isStarred" } },
                      ],
                    },
                    else: "$$card",
                  },
                },
              },
            },
          },
        },
      ],
      { new: true }
    ).lean();

    if (!updatedFlashCardSet) {
      return {
        success: false,
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Flashcard not found",
      };
    }

    const card = updatedFlashCardSet.cards.find(
      (card) => card._id.toString() === cardId.toString()
    );

    if (!card) {
      return {
        success: false,
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Card not found",
      };
    }

    return {
      success: true,
      statusCode: STATUS_CODES.OK,
      message: `Flashcard ${card.isStarred ? "starred" : "unstarred"}`,
      data: updatedFlashCardSet,
    };
  };

  public reviewFlashcard = async (
    cardId: string,
    userId: string
  ): Promise<Response<FlashcardEntity>> => {
    const result = await Flashcard.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        "cards._id": new mongoose.Types.ObjectId(cardId),
      },
      {
        $set: { "cards.$.lastReviewed": new Date() },
        $inc: { "cards.$.reviewCount": 1 },
      },
      { new: true }
    ).lean();

    if (!result)
      return {
        success: false,
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Flashcard not found",
      };

    return {
      success: true,
      statusCode: STATUS_CODES.OK,
      message: "Flashcard reviewed successfully",
      data: result,
    };
  };

  public getAllFlashcardSets = async (
    userId: string
  ): Promise<{ data: FlashcardEntity[]; count: number }> => {
    const flashcardSets = await Flashcard.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate("documentId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return {
      data: flashcardSets,
      count: flashcardSets.length,
    };
  };

  public getFlashcards = async (
    userId: string,
    documentId: string
  ): Promise<{ data: FlashcardEntity[]; count: number }> => {
    const flashcards = await Flashcard.find({
      userId: new mongoose.Types.ObjectId(userId),
      documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 })
      .lean();

    return {
      data: flashcards,
      count: flashcards.length,
    };
  };

  public getFlashcardCount = async (
    query: Partial<FlashcardEntity>
  ): Promise<number> => {
    const flashcardCount = await Flashcard.countDocuments(query);
    return flashcardCount;
  };
}

export default new FlashcardRepository();
