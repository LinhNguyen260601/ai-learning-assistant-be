import type { Request, Response } from "express";
import { tryCatch } from "../utils";
import quizService from "../services/quiz.service";

class QuizController {
  public getQuizzes = tryCatch(async (req: Request, res: Response) => {
    const response = await quizService.getQuizzes(
      req.user?._id as string,
      req.params.documentId
    );
    res.status(response.statusCode).json(response);
  });

  public getQuiz = tryCatch(async (req: Request, res: Response) => {
    const response = await quizService.getQuiz(
      req.params.id,
      req.user?._id as string
    );
    res.status(response.statusCode).json(response);
  });

  public getQuizResults = tryCatch(async (req: Request, res: Response) => {
    const response = await quizService.getQuizResults(
      req.user?._id as string,
      req.params.id
    );
    res.status(response.statusCode).json(response);
  });

  public submitQuiz = tryCatch(async (req: Request, res: Response) => {
    const response = await quizService.submitQuiz(
      req.body,
      req.user?._id as string,
      req.params.id
    );
    res.status(response.statusCode).json(response);
  });

  public deleteQuiz = tryCatch(async (req: Request, res: Response) => {
    const response = await quizService.deleteQuiz(
      req.user?._id as string,
      req.params.id
    );
    res.status(response.statusCode).json(response);
  });
}

export default new QuizController();
