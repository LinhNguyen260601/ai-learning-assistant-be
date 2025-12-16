import { unlink } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { ENVIRONMENTS, STATUS_CODES } from "../constants";
import {
  documentRepository,
  flashcardRepository,
  quizRepository,
} from "../repositories";
import { DocumentStatus, type DocumentEntity, type Response } from "../types";
import { chunkText, extractTextFromPdf } from "../utils";
import mongoose from "mongoose";
import { cloudinary } from "../config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Please provide a title for the document",
        };
      }

      // Upload file buffer to Cloudinary
      const uploadResult = await new Promise<{
        secure_url: string;
        public_id: string;
        bytes: number;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "ai-learning-assistant",
            format: "pdf",
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload failed"));
              return;
            }

            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              bytes: result.bytes,
            });
          }
        );

        uploadStream.end(file.buffer);
      });

      // Create document record
      const document = await documentRepository.createDocument({
        userId: new mongoose.Types.ObjectId(userId),
        title,
        fileName: file.originalname,
        filePath: uploadResult.secure_url,
        fileSize: uploadResult.bytes,
        // @ts-expect-error - allow extra field without changing type right now
        cloudinaryPublicId: uploadResult.public_id,
        status: DocumentStatus.PROCESSING,
      });

      // Process PDF in background (in production, use a queue like Bull)
      this.processPDF(document._id.toString(), file.buffer).catch(
        (error: unknown) => {
          console.error("PDF processing failed", error);
        }
      );

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
    fileBuffer: Buffer
  ): Promise<void> => {
    try {
      const { text } = await extractTextFromPdf(fileBuffer);

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

      // Delete file from Cloudinary if publicId is stored
      const publicId = (document as any).cloudinaryPublicId as
        | string
        | undefined;
      if (publicId) {
        await cloudinary.uploader
          .destroy(publicId, { resource_type: "raw" })
          .catch(() => {});
      }

      // Delete related flashcards and quizzes
      await Promise.all([
        flashcardRepository.deleteByDocumentId(
          userIdObjectId.toString(),
          document._id.toString()
        ),
        quizRepository.deleteByDocumentId(
          userIdObjectId.toString(),
          document._id.toString()
        ),
      ]);

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
