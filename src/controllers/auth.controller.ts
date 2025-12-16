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

  public getMe = tryCatch(async (req: Request, res: Response) => {
    const response = await authService.getMe(req.user?._id as string);
    res.status(response.statusCode).json(response);
  });

  public updateMe = tryCatch(async (req: Request, res: Response) => {
    const response = await authService.updateMe(
      req.body,
      req.user?._id as string,
      req.file as Express.Multer.File | undefined
    );
    res.status(response.statusCode).json(response);
  });

  public changePassword = tryCatch(async (req: Request, res: Response) => {
    const response = await authService.changePassword(
      req.body,
      req.user?._id as string
    );
    res.status(response.statusCode).json(response);
  });
}

export default new AuthController();
