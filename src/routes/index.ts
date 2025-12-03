import { Router } from "express";
import authRouter from "./auth.route";
import documentRouter from "./document.route";
import flashcardRouter from "./flashcard.route";
import aiRouter from "./ai.route";
import quizRouter from "./quiz.route";
import progressRouter from "./progress.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/documents", documentRouter);
router.use("/flashcards", flashcardRouter);
router.use("/ai", aiRouter);
router.use("/quizzes", quizRouter);
router.use("/progress", progressRouter);

export default router;
