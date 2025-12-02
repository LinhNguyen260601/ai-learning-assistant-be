import { Quiz } from "../models";
import type { CreateQuizDTO, QuizEntity } from "../types";

class QuizRepository {
  public createQuiz = async (payload: CreateQuizDTO): Promise<QuizEntity> => {
    const quiz = (await Quiz.create(payload as any)) as any;
    return quiz.toObject() as QuizEntity;
  };

  public getQuizCount = async (query: Partial<QuizEntity>): Promise<number> => {
    const quizCount = await Quiz.countDocuments(query);
    return quizCount;
  };
}

export default new QuizRepository();
