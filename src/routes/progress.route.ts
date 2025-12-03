import { Router } from "express";
import { protectedRoute } from "../middleware";
import { progressController } from "../controllers";

const progressRouter = Router();

progressRouter.use(protectedRoute);

progressRouter.get("/dashboard", progressController.getDashboard);

export default progressRouter;
