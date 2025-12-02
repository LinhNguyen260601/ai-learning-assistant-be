import { STATUS_CODES } from "../constants";
import { flashcardRepository } from "../repositories";
import type { FlashcardEntity, Response } from "../types";

class FlashcardService {
  public getFlashcards = async (
    userId: string,
    documentId: string
  ): Promise<Response<{ flashcards: FlashcardEntity[]; count: number }>> => {
    try {
      const { data: flashcards, count } =
        await flashcardRepository.getFlashcards(userId, documentId);
      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Flashcards fetched successfully",
        data: {
          flashcards,
          count,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public getAllFlashcardSets = async (
    userId: string
  ): Promise<Response<{ flashcardSets: FlashcardEntity[]; count: number }>> => {
    try {
      const { data: flashcardSets, count } =
        await flashcardRepository.getAllFlashcardSets(userId);
      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Flashcard sets fetched successfully",
        data: {
          flashcardSets,
          count,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public reviewFlashcard = async (
    userId: string,
    cardId: string
  ): Promise<Response<FlashcardEntity>> => {
    try {
      const flashcardSet = await flashcardRepository.reviewFlashcard(
        cardId,
        userId
      );

      return flashcardSet;
    } catch (error) {
      throw error;
    }
  };

  public toggleStarFlashcard = async (
    userId: string,
    cardId: string
  ): Promise<Response<FlashcardEntity>> => {
    try {
      const flashcardSet = await flashcardRepository.toggleStarFlashcard(
        cardId,
        userId
      );
      return flashcardSet;
    } catch (error) {
      throw error;
    }
  };

  public deleteFlashcard = async (
    id: string,
    userId: string
  ): Promise<Response<FlashcardEntity>> => {
    try {
      const flashcardSet = await flashcardRepository.deleteFlashcard(
        id,
        userId
      );
      return flashcardSet;
    } catch (error) {
      throw error;
    }
  };
}

export default new FlashcardService();
