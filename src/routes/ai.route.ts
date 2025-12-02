import { Router } from "express";
import { protectedRoute } from "../middleware";
import { aiController } from "../controllers";

const aiRouter = Router();

aiRouter.use(protectedRoute);

aiRouter.post("/generate-flashcards", aiController.generateFlashcards);
aiRouter.post("/generate-quiz", aiController.generateQuiz);
aiRouter.post("/generate-summary", aiController.generateSummary);
aiRouter.post("/chat", aiController.chat);
aiRouter.post("/explain-concept", aiController.explainConcept);

aiRouter.get("/chat-history/:documentId", aiController.getChatHistory);

export default aiRouter;
