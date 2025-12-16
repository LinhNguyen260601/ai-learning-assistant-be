import mongoose from "mongoose";
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

  public getQuiz = async (query: Partial<QuizEntity>) => {
    const quiz = await Quiz.findOne(query);
    return quiz;
  };

  public getQuizzes = async (
    userId: string,
    documentId: string
  ): Promise<QuizEntity[]> => {
    const quizzes = await Quiz.find({
      userId: new mongoose.Types.ObjectId(userId),
      documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 })
      .lean();
    return quizzes as QuizEntity[];
  };

  public deleteByDocumentId = async (
    userId: string,
    documentId: string
  ): Promise<void> => {
    await Quiz.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
      documentId,
    });
  };
}

export default new QuizRepository();
