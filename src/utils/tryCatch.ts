import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async controller function to automatically catch errors
 * and pass them to the error handling middleware
 *
 * @param fn - The async controller function to wrap
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
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
