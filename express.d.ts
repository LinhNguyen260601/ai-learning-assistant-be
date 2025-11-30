import type { UserEntity } from "./src/types";

declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
      file?: Express.Multer.File;
    }
  }
}

export {};
