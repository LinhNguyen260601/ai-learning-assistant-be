import { Router } from "express";
import authRouter from "./auth.route";
import documentRouter from "./document.route";
import flashcardRouter from "./flashcard.route";
import aiRouter from "./ai.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/documents", documentRouter);
router.use("/flashcards", flashcardRouter);
router.use("/ai", aiRouter);

export default router;
