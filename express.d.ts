import type { UserEntity } from "./src/types";

declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
    }
  }
}

export {};
