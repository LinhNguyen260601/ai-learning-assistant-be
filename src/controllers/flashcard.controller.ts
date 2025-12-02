import type { Request, Response } from "express";
import { tryCatch } from "../utils";
import { flashcardService } from "../services";

class FlashcardController {
  public getFlashcards = tryCatch(async (req: Request, res: Response) => {
    const response = await flashcardService.getFlashcards(
      req.user?._id as string,
      req.params.documentId
    );
    res.status(response.statusCode).json(response);
  });

  public getAllFlashcardSets = tryCatch(async (req: Request, res: Response) => {
    const response = await flashcardService.getAllFlashcardSets(
      req.user?._id as string
    );
    res.status(response.statusCode).json(response);
  });

  public reviewFlashcard = tryCatch(async (req: Request, res: Response) => {
    const response = await flashcardService.reviewFlashcard(
      req.user?._id as string,
      req.params.cardId
    );
    res.status(response.statusCode).json(response);
  });

  public toggleStarFlashcard = tryCatch(async (req: Request, res: Response) => {
    const response = await flashcardService.toggleStarFlashcard(
      req.user?._id as string,
      req.params.cardId
    );
    res.status(response.statusCode).json(response);
  });

  public deleteFlashcard = tryCatch(async (req: Request, res: Response) => {
    const response = await flashcardService.deleteFlashcard(
      req.params.id,
      req.user?._id as string
    );
    res.status(response.statusCode).json(response);
  });
}

export default new FlashcardController();
