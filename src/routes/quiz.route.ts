import { Router } from "express";
import { protectedRoute } from "../middleware/auth.middleware";
import { quizController } from "../controllers";

const quizRouter = Router();

quizRouter.use(protectedRoute);

quizRouter.get("/:documentId", quizController.getQuizzes);
quizRouter.get("/quiz/:id", quizController.getQuiz);
quizRouter.get("/:id/results", quizController.getQuizResults);
quizRouter.post("/:id/submit", quizController.submitQuiz);
quizRouter.delete("/:id", quizController.deleteQuiz);

export default quizRouter;
