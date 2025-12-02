import type { Request, Response, NextFunction } from "express";
import { aiService } from "../services";

class AiController {
  public generateFlashcards = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const response = await aiService.generateFlashcards(
        req.body,
        req.user?._id as string
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  };

  public generateQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const response = await aiService.generateQuiz(
        req.body,
        req.user?._id as string
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  };

  public generateSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const response = await aiService.generateSummary(
        req.body,
        req.user?._id as string
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  };

  public chat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const response = await aiService.chat(req.body, req.user?._id as string);
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  };

  public explainConcept = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const response = await aiService.explainConcept(
        req.body,
        req.user?._id as string
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getChatHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res.status(501).json({
        success: false,
        message: "getChatHistory is not implemented yet",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AiController();
