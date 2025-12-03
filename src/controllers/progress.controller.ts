import type { Request, Response } from "express";
import { progressService } from "../services";
import { tryCatch } from "../utils";

class ProgressController {
  public getDashboard = tryCatch(async (req: Request, res: Response) => {
    const response = await progressService.getDashboard(
      req.user?._id as string
    );
    res.status(response.statusCode).json(response);
  });
}

export default new ProgressController();
