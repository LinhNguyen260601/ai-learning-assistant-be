import { Router } from "express";
import { protectedRoute } from "../middleware";
import { documentController } from "../controllers";
import { upload } from "../config";

const documentRouter = Router();

documentRouter.use(protectedRoute);

documentRouter.post(
  "/upload",
  upload.single("file"),
  documentController.uploadDocument
);
documentRouter.get("/", documentController.getDocuments);
documentRouter.get("/:id", documentController.getDocument);
documentRouter.delete("/:id", documentController.deleteDocument);

export default documentRouter;
