import { Router } from "express";
import authRouter from "./auth.route";
import documentRouter from "./document.route";
import flashcardRouter from "./flashcard.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/documents", documentRouter);
router.use("/flashcards", flashcardRouter);

export default router;
