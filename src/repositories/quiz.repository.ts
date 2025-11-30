import { Quiz } from "../models";
import type { QuizEntity } from "../types";

class QuizRepository {
  public getQuizCount = async (query: Partial<QuizEntity>): Promise<number> => {
    const quizCount = await Quiz.countDocuments(query);
    return quizCount;
  };
}

export default new QuizRepository();
