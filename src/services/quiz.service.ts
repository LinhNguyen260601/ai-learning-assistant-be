import mongoose from "mongoose";
import { STATUS_CODES } from "../constants";
import { documentRepository, quizRepository } from "../repositories";
import type { QuizEntity, Response } from "../types";

class QuizService {
  public getQuizzes = async (
    userId: string,
    documentId: string
  ): Promise<Response<{ quizzes: QuizEntity[]; count: number }>> => {
    try {
      const quizzes = await quizRepository.getQuizzes(userId, documentId);
      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Quizzes fetched successfully",
        data: {
          quizzes,
          count: quizzes.length,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public getQuiz = async (
    id: string,
    userId: string
  ): Promise<Response<QuizEntity>> => {
    try {
      const quiz = await quizRepository.getQuiz({
        _id: id,
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!quiz) {
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Quiz not found",
        };
      }

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Quiz fetched successfully",
        data: quiz,
      };
    } catch (error) {
      throw error;
    }
  };

  public submitQuiz = async (
    payload: { answers: { questionIndex: number; selectedAnswer: string }[] },
    userId: string,
    id: string
  ): Promise<
    Response<{
      quizId: string;
      score: number;
      correctCount: number;
      totalQuestions: number;
      percentage: number;
      userAnswers: {
        questionIndex: number;
        selectedAnswer: string;
        isCorrect: boolean;
        answeredAt: Date;
      }[];
    }>
  > => {
    try {
      const { answers } = payload;

      if (!Array.isArray(answers))
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Answers must be an array",
        };

      const quiz = await quizRepository.getQuiz({
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      });
      if (!quiz) {
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Quiz not found",
        };
      }

      if (quiz.completedAt)
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Quiz already completed",
        };

      // Process the answers
      let correctCount = 0;
      const userAnswers: {
        questionIndex: number;
        selectedAnswer: string;
        isCorrect: boolean;
        answeredAt: Date;
      }[] = [];

      answers.forEach((answer) => {
        const { questionIndex, selectedAnswer } = answer;

        if (questionIndex < quiz.questions.length) {
          const question = quiz.questions[questionIndex];
          const isCorrect = selectedAnswer === question.correctAnswer;

          if (isCorrect) correctCount++;

          userAnswers.push({
            questionIndex,
            selectedAnswer,
            isCorrect,
            answeredAt: new Date(),
          });
        }
      });

      const score = Math.round((correctCount / quiz.totalQuestions) * 100);

      quiz.userAnswers.push(...(userAnswers as any[]));
      quiz.score = score;
      quiz.completedAt = new Date();

      await quiz.save({ validateModifiedOnly: true });

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Quiz submitted successfully",
        data: {
          quizId: quiz._id.toString(),
          score,
          correctCount,
          totalQuestions: quiz.totalQuestions,
          percentage: score,
          userAnswers,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public getQuizResults = async (
    userId: string,
    id: string
  ): Promise<
    Response<{
      quiz: {
        id: string;
        title: string;
        document: {
          id: string;
          title: string;
        };
        score: number;
        totalQuestions: number;
        completedAt: Date;
      };
      results: {
        questionIndex: number;
        question: string;
        options: string[];
        correctAnswer: string;
        selectedAnswer: string | undefined;
        isCorrect: boolean | undefined;
        explanation: string;
      }[];
    }>
  > => {
    try {
      const quiz = await quizRepository.getQuiz({
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      });
      if (!quiz) {
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Quiz not found",
        };
      }

      if (!quiz.completedAt) {
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Quiz not completed",
        };
      }

      const document = await documentRepository.findDocument({
        _id: new mongoose.Types.ObjectId(quiz.documentId),
      });

      // Build detailed results
      const detailedResults = quiz.questions.map((question, index) => {
        const userAnswer = quiz.userAnswers.find(
          (answer) => answer.questionIndex === index
        );

        return {
          questionIndex: index,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          selectedAnswer: userAnswer?.selectedAnswer,
          isCorrect: userAnswer?.isCorrect,
          explanation: question.explanation,
        };
      });

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Quiz results fetched successfully",
        data: {
          quiz: {
            id: quiz._id.toString(),
            title: quiz.title,
            document: {
              id: quiz.documentId,
              title: document?.title ?? "",
            },
            score: quiz.score,
            totalQuestions: quiz.totalQuestions,
            completedAt: quiz.completedAt,
          },
          results: detailedResults,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public deleteQuiz = async (
    userId: string,
    id: string
  ): Promise<Response<void>> => {
    try {
      const quiz = await quizRepository.getQuiz({
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      });
      if (!quiz) {
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Quiz not found",
        };
      }
      await quiz.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Quiz deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  };
}

export default new QuizService();
