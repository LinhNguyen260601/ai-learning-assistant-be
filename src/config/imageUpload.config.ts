import type { Request } from "express";
import multer, { type FileFilterCallback } from "multer";
import { ENVIRONMENTS } from "../constants";

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image files are allowed") as unknown as null, false);
};

const uploadProfileImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: ENVIRONMENTS.MAX_FILE_SIZE,
  },
});

export default uploadProfileImage;
