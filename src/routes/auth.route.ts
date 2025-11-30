import { Router } from "express";
import { authController } from "../controllers";
import { protectedRoute } from "../middleware";
import { loginValidation, registerValidation } from "../middleware/validations";

const authRouter = Router();

// Public routes
authRouter.post("/register", registerValidation, authController.register);
authRouter.post("/login", loginValidation, authController.login);

// Protected routes
authRouter.use(protectedRoute);
authRouter.get("/me", authController.getMe);
authRouter.patch("/me", authController.updateMe);
authRouter.post("/change-password", authController.changePassword);

export default authRouter;
