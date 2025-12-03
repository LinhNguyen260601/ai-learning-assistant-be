import mongoose from "mongoose";
import {
  documentRepository,
  flashcardRepository,
  quizRepository,
} from "../repositories";
import { Document, Flashcard, Quiz } from "../models";
import { STATUS_CODES } from "../constants";
import type { DocumentEntity, QuizEntity, Response } from "../types";

class ProgressService {
  public getDashboard = async (
    userId: string
  ): Promise<
    Response<{
      overview: {
        totalDocuments: number;
        totalFlashcardSets: number;
        totalFlashcards: number;
        reviewedFlashcards: number;
        starredFlashcards: number;
        totalQuizzes: number;
        completedQuizzes: number;
        averageScore: number;
        studyStreak: number;
      };
      recentActivity: {
        documents: DocumentEntity[];
        quizzes: QuizEntity[];
      };
    }>
  > => {
    try {
      // Get counts
      const totalDocuments = await documentRepository.getTotalDocuments(userId);
      const totalFlashcardSets =
        await flashcardRepository.getTotalFlashcardSets(userId);
      const totalQuizzes = await quizRepository.getQuizCount({
        userId: new mongoose.Types.ObjectId(userId),
      });
      const completedQuizzes = await quizRepository.getQuizCount({
        userId: new mongoose.Types.ObjectId(userId),
        completedAt: { $ne: null } as any,
      });

      // Get flashcard statstics
      const flashcardSets = await Flashcard.find({ userId });
      let totalFlashcards = 0;
      let reviewedFlashcards = 0;
      let starredFlashcards = 0;

      flashcardSets.forEach((flashcardSet) => {
        totalFlashcards += flashcardSet.cards.length;
        reviewedFlashcards += flashcardSet.cards.filter(
          (card) => card.reviewCount > 0
        ).length;
        starredFlashcards += flashcardSet.cards.filter(
          (card) => card.isStarred
        ).length;
      });

      // Get quiz statstics
      const quizzes = await Quiz.find({ userId });
      const averageScore =
        quizzes.length > 0
          ? Math.round(
              quizzes.reduce((acc, quiz) => acc + quiz.score, 0) /
                quizzes.length
            )
          : 0;

      //  Recent activity
      const recentDocuments = await Document.find({ userId })
        .sort({ lastAccessed: -1 })
        .limit(5)
        .select("title fileName lastAccessed status");

      const recentQuizzes = await Quiz.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("documentId", "title")
        .select("title score totalQuestions completedAt");

      // Study strreak (simplified - in production, track daily activity)
      const studyStreak = Math.floor(Math.random() * 7) + 1; //Mock data;

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Dashboard fetched successfully",
        data: {
          overview: {
            totalDocuments,
            totalFlashcardSets,
            totalFlashcards,
            reviewedFlashcards,
            starredFlashcards,
            totalQuizzes,
            completedQuizzes,
            averageScore,
            studyStreak,
          },
          recentActivity: {
            documents: recentDocuments,
            quizzes: recentQuizzes,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  };
}

export default new ProgressService();
