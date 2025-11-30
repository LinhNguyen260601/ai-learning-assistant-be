import type { Request } from "express";
import { existsSync, mkdirSync } from "fs";
import multer, { diskStorage, type FileFilterCallback } from "multer";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { ENVIRONMENTS } from "../constants";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = join(__dirname, "../uploads/documents");
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadDir);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// File filter -only PDFS
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
    return;
  }

  cb(new Error("Only PDF files are allowed") as unknown as null, false);
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: ENVIRONMENTS.MAX_FILE_SIZE,
  },
});

export default upload;
