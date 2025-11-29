import type { Request, Response } from "express";
import { STATUS_CODES } from "../constants/status.constant";
import { tryCatch } from "../utils";
import { authService } from "../services";

class AuthController {
  public register = tryCatch(async (req: Request, res: Response) => {
    const response = await authService.register(req.body);
    res.status(response.statusCode).json(response);
  });

  async login(req: Request, res: Response) {}

  async getMe(req: Request, res: Response) {}

  async updateMe(req: Request, res: Response) {}

  async changePassword(req: Request, res: Response) {}
}

export default new AuthController();
