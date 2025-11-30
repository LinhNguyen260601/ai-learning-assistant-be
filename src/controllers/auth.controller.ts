import type { Request, Response } from "express";
import { authService } from "../services";
import { tryCatch } from "../utils";

class AuthController {
  public register = tryCatch(async (req: Request, res: Response) => {
    const response = await authService.register(req.body);
    res.status(response.statusCode).json(response);
  });

  public login = tryCatch(async (req: Request, res: Response) => {
    const response = await authService.login(req.body);
    res.status(response.statusCode).json(response);
  });

  async getMe(req: Request, res: Response) {}

  async updateMe(req: Request, res: Response) {}

  async changePassword(req: Request, res: Response) {}
}

export default new AuthController();
