import { Router } from "express";
import { authController } from "../controllers";
import { protectedRoute } from "../middleware";
import { loginValidation, registerValidation } from "../middleware/validations";
import { uploadProfileImage } from "../config";

const authRouter = Router();

// Public routes
authRouter.post("/register", registerValidation, authController.register);
authRouter.post("/login", loginValidation, authController.login);

// Protected routes
authRouter.use(protectedRoute);
authRouter.get("/me", authController.getMe);
authRouter.patch(
  "/me",
  uploadProfileImage.single("profileImage"),
  authController.updateMe
);
authRouter.post("/change-password", authController.changePassword);

export default authRouter;
