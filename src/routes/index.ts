import { Router } from "express";
import authRouter from "./auth.route";
import documentRouter from "./document.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/documents", documentRouter);

export default router;
