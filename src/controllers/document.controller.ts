import type { Request, Response } from "express";
import { tryCatch } from "../utils";
import { documentService } from "../services";
import { unlink } from "fs/promises";

class DocumentController {
  public uploadDocument = tryCatch(
    async (req: Request, res: Response) => {
      const response = await documentService.uploadDocument(
        req.user?._id as string,
        req.body,
        req.file as Express.Multer.File
      );
      res.status(response.statusCode).json(response);
    },
    async (req: Request) => {
      //Clean up file on error
      if (req.file) await unlink(req.file.path).catch(() => {});
    }
  );

  public getDocuments = tryCatch(async (req: Request, res: Response) => {
    const response = await documentService.getDocuments(
      req.user?._id as string
    );
    res.status(response.statusCode).json(response);
  });

  public getDocument = tryCatch(async (req: Request, res: Response) => {
    const response = await documentService.getDocument(
      req.params.id,
      req.user?._id as string
    );
    res.status(response.statusCode).json(response);
  });

  public deleteDocument = tryCatch(async (req: Request, res: Response) => {
    const response = await documentService.deleteDocument(
      req.params.id,
      req.user?._id as string
    );
    res.status(response.statusCode).json(response);
  });
}

export default new DocumentController();
