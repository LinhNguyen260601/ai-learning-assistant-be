import { unlink } from "fs/promises";
import { ENVIRONMENTS, STATUS_CODES } from "../constants";
import {
  documentRepository,
  flashcardRepository,
  quizRepository,
} from "../repositories";
import { DocumentStatus, type DocumentEntity, type Response } from "../types";
import { chunkText, extractTextFromPdf } from "../utils";
import mongoose from "mongoose";

class DocumentService {
  public uploadDocument = async (
    userId: string,
    payload: DocumentEntity,
    file: Express.Multer.File
  ) => {
    try {
      if (!file)
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Please upload a PDF file",
        };

      const { title } = payload;

      if (!title) {
        // Delete uploaded file if not title provided
        await unlink(file.path);
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Please provide a title for the document",
        };
      }

      // Construct the URL for the uploaded file
      const baseUrl = `http://localhost:${ENVIRONMENTS.PORT}`;
      const fileUrl = `${baseUrl}/uploads/documents/${file.filename}`;

      // Create document record
      const document = await documentRepository.createDocument({
        userId: new mongoose.Types.ObjectId(userId),
        title,
        fileName: file.originalname,
        filePath: fileUrl,
        fileSize: file.size,
        status: DocumentStatus.PROCESSING,
      });

      // Process PDF in background (in production, use a queue like Bull)
      this.processPDF(document._id.toString(), file.path).catch((error) => {
        console.error("PDF processing failed", error);
      });

      return {
        success: true,
        statusCode: STATUS_CODES.CREATED,
        message: "Document uploaded successfully. Processing in progress...",
        data: document,
      };
    } catch (error) {
      throw error;
    }
  };

  private processPDF = async (
    documentId: string,
    filePath: string
  ): Promise<void> => {
    try {
      const { text } = await extractTextFromPdf(filePath);

      // Create chunks
      const chunks = chunkText(text, 500, 50);

      // Update document
      await documentRepository.updateDocument(documentId, {
        extractedText: text,
        chunks: chunks,
        status: DocumentStatus.READY,
      });

      console.log(`PDF processed successfully for document ${documentId}`);
    } catch (error) {
      console.error("PDF processing failed", error);
      await documentRepository.updateDocument(documentId, {
        status: DocumentStatus.FAILED,
      });
      throw error;
    }
  };

  public getDocuments = async (
    userId: string
  ): Promise<Response<{ documents: DocumentEntity[]; count: number }>> => {
    try {
      const documents = await documentRepository.findDocumentsByUserId(userId);
      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Documents fetched successfully",
        data: {
          documents,
          count: documents.length,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public getDocument = async (
    id: string,
    userId: string
  ): Promise<
    Response<DocumentEntity & { flashcardCount: number; quizCount: number }>
  > => {
    try {
      const userIdObjectId = new mongoose.Types.ObjectId(userId);

      const document = await documentRepository.findDocument({
        _id: id,
        userId: userIdObjectId,
      });

      if (!document)
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Document not found",
        };

      const flashcardCount = await flashcardRepository.getFlashcardCount({
        documentId: document._id.toString(),
        userId: userIdObjectId,
      });
      const quizCount = await quizRepository.getQuizCount({
        documentId: document._id.toString(),
        userId: userIdObjectId,
      });

      document.lastAccessed = new Date();
      await document.save();

      // Combine document data with counts
      const documentData = document.toObject() as DocumentEntity & {
        flashcardCount: number;
        quizCount: number;
      };
      documentData.flashcardCount = flashcardCount;
      documentData.quizCount = quizCount;

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Document fetched successfully",
        data: documentData,
      };
    } catch (error) {
      throw error;
    }
  };

  public deleteDocument = async (id: string, userId: string) => {
    try {
      const userIdObjectId = new mongoose.Types.ObjectId(userId);
      const document = await documentRepository.findDocument({
        _id: id,
        userId: userIdObjectId,
      });

      if (!document)
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Document not found",
        };

      // Delete file from file system
      await unlink(document.filePath).catch(() => {});

      // Delete document from database
      await document.deleteOne();

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Document deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  };
}

export default new DocumentService();
