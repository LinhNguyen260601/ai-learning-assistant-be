import { Flashcard } from "../models";
import type { FlashcardEntity } from "../types";

class FlashcardRepository {
  public getFlashcardCount = async (
    query: Partial<FlashcardEntity>
  ): Promise<number> => {
    const flashcardCount = await Flashcard.countDocuments(query);
    return flashcardCount;
  };
}

export default new FlashcardRepository();
