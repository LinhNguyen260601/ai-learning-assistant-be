import mongoose from "mongoose";
import { Flashcard } from "../models";
import type {
  FlashcardEntity,
  Response,
  Difficulty,
  CreateFlashcardDTO,
} from "../types";
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
    const flashcardSet = await Flashcard.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      "cards._id": new mongoose.Types.ObjectId(cardId),
    });

    if (!flashcardSet) {
      return {
        success: false,
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Flashcard not found",
      };
    }

    const card = flashcardSet.cards.find(
      (c) => c._id.toString() === cardId.toString()
    );

    if (!card) {
      return {
        success: false,
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Card not found",
      };
    }

    card.isStarred = !card.isStarred;
    const updatedFlashCardSet = await flashcardSet.save();

    return {
      success: true,
      statusCode: STATUS_CODES.OK,
      message: `Flashcard ${card.isStarred ? "starred" : "unstarred"}`,
      data: updatedFlashCardSet.toObject() as FlashcardEntity,
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

  public createFlashcardSet = async (
    payload: CreateFlashcardDTO
  ): Promise<FlashcardEntity> => {
    const flashcardSet = await Flashcard.create(payload);
    return flashcardSet.toObject() as FlashcardEntity;
  };
}

export default new FlashcardRepository();
