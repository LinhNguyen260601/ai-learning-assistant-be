import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async controller function to automatically catch errors
 * and pass them to the error handling middleware
 *
 * @param fn - The async controller function to wrap
 * @param cachCb - A callback function to clean up resources on error
 * @returns A new function that handles errors automatically
 *
 * @example
 *pescript
 * router.get('/users', tryCatch(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 *  */
export const tryCatch =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
    cachCb?: (req: Request, res: Response, next: NextFunction) => void
  ) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error: Error) => {
      if (cachCb) cachCb(req, res, next);
      next(new Error(error.message));
    });
  };
