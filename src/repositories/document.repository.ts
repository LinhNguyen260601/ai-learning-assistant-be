import mongoose, { Document, Types } from "mongoose";
import { Document as DocumentModel } from "../models";
import type { DocumentEntity } from "../types";

class DocumentRepository {
  public findDocument = async (
    query: Partial<DocumentEntity>
  ): Promise<(Document & DocumentEntity) | null> =>
    await DocumentModel.findOne(query);

  public findDocumentsByUserId = async (
    userId: string
  ): Promise<DocumentEntity[]> => {
    const documents: DocumentEntity[] = await DocumentModel.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      {
        $sort: { uploadDate: -1 },
      },
    ]);

    return documents;
  };

  public createDocument = async (
    payload: Partial<DocumentEntity> & { userId: Types.ObjectId }
  ) => {
    const document = await DocumentModel.create(payload);
    return document;
  };

  public updateDocument = async (
    documentId: string,
    payload: Partial<DocumentEntity> | any
  ) => {
    const document = await DocumentModel.findByIdAndUpdate(
      documentId,
      payload,
      {
        new: true,
      }
    );
    return document;
  };

  public getTotalDocuments = async (userId: string): Promise<number> => {
    const totalDocuments = await DocumentModel.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    });
    return totalDocuments;
  };
}

export default new DocumentRepository();
