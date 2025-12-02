import { Router } from "express";
import { protectedRoute } from "../middleware";
import { flashcardController } from "../controllers";

const flashcardRouter = Router();

flashcardRouter.use(protectedRoute);

flashcardRouter.get("/", flashcardController.getAllFlashcardSets);
flashcardRouter.get("/:documentId", flashcardController.getFlashcards);
flashcardRouter.post("/:cardId/review", flashcardController.reviewFlashcard);
flashcardRouter.put("/:cardId/star", flashcardController.toggleStarFlashcard);
flashcardRouter.delete("/:id", flashcardController.deleteFlashcard);

export default flashcardRouter;
