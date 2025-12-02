import mongoose from "mongoose";
import { STATUS_CODES } from "../constants";
import {
  documentRepository,
  flashcardRepository,
  quizRepository,
} from "../repositories";
import {
  Difficulty,
  DocumentStatus,
  type ChatHistoryEntity,
  type FlashcardEntity,
  type QuizEntity,
  type Response,
} from "../types";
import {
  chatWithContext,
  explainConcept,
  findRelevantChunks,
  generateFlashcard,
  generateQuiz,
  genrateSummary,
} from "../utils";
import { ChatHistory } from "../models";
import chatHistoryRepository from "../repositories/chatHistory.repository";

class AiService {
  public generateFlashcards = async (
    payload: { documentId: string; count: number },
    userId: string
  ): Promise<Response<FlashcardEntity>> => {
    try {
      const { documentId, count = 10 } = payload;
      if (!documentId)
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Document ID is required",
        };

      const document = await documentRepository.findDocument({
        _id: documentId,
        userId: new mongoose.Types.ObjectId(userId),
        status: DocumentStatus.READY,
      });
      if (!document)
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Document not found",
        };

      // Generate flashcards
      const flashcards = await generateFlashcard(document.extractedText, count);

      const flashCardSet = await flashcardRepository.createFlashcardSet({
        userId: new mongoose.Types.ObjectId(userId),
        documentId: document._id.toString(),
        cards: (flashcards ?? []).map((card) => ({
          question: card.question,
          answer: card.answer,
          difficulty: card.difficulty as Difficulty,
          reviewCount: 0,
          isStarred: false,
        })),
      });

      return {
        success: true,
        statusCode: STATUS_CODES.CREATED,
        message: "Flashcards generated successfully",
        data: flashCardSet,
      };
    } catch (error) {
      throw error;
    }
  };

  public generateQuiz = async (
    payload: { documentId: string; numQuestions: number; title: string },
    userId: string
  ): Promise<Response<QuizEntity>> => {
    try {
      const { documentId, numQuestions = 5, title = "" } = payload;
      if (!documentId)
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Document ID is required",
        };

      const document = await documentRepository.findDocument({
        _id: documentId,
        userId: new mongoose.Types.ObjectId(userId),
        status: DocumentStatus.READY,
      });
      if (!document)
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Document not found or not ready",
        };

      const questions = await generateQuiz(
        document.extractedText,
        numQuestions
      );

      const quiz = await quizRepository.createQuiz({
        userId: new mongoose.Types.ObjectId(userId),
        documentId: document._id.toString(),
        title: title || `${document.title} - Quiz`,
        questions: questions ?? [],
        totalQuestions: (questions ?? []).length,
        userAnswers: [],
        score: 0,
      });

      return {
        success: true,
        statusCode: STATUS_CODES.CREATED,
        message: "Quiz generated successfully",
        data: quiz,
      };
    } catch (error) {
      throw error;
    }
  };

  public generateSummary = async (
    body: { documentId: string },
    userId: string
  ): Promise<
    Response<{ documentId: string; title: string; summary: string }>
  > => {
    try {
      const { documentId } = body;
      if (!documentId)
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Document ID is required",
        };

      const document = await documentRepository.findDocument({
        _id: documentId,
        userId: new mongoose.Types.ObjectId(userId),
        status: DocumentStatus.READY,
      });
      if (!document)
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Document not found or not ready",
        };

      const summary = await genrateSummary(document.extractedText);

      return {
        success: true,
        statusCode: STATUS_CODES.CREATED,
        message: "Summary generated successfully",
        data: {
          documentId: document._id.toString(),
          title: document.title,
          summary: summary ?? "",
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public chat = async (
    body: { documentId: string; question: string },
    userId: string
  ) => {
    try {
      const { documentId, question } = body;

      if (!documentId || !question)
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Document ID and question are required",
        };

      const document = await documentRepository.findDocument({
        _id: documentId,
        userId: new mongoose.Types.ObjectId(userId),
        status: DocumentStatus.READY,
      });

      if (!document)
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Document not found or not ready",
        };

      const relevantChunks = findRelevantChunks(document.chunks, question, 3);
      const chunkIndices = relevantChunks.map((chunk) => chunk.chunkIndex);

      let chatHistory = await ChatHistory.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        documentId: document._id,
      });

      if (!chatHistory) {
        chatHistory = await ChatHistory.create({
          userId: new mongoose.Types.ObjectId(userId),
          documentId: document._id,
          messages: [],
        });
      }

      const answer = await chatWithContext(question, relevantChunks);

      chatHistory.messages.push(
        {
          role: "user",
          content: question,
          relevantChunks: [],
        },
        {
          role: "assistant",
          content: answer ?? "",
          timestamp: new Date(),
          relevantChunks: chunkIndices,
        }
      );

      await chatHistory.save();

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Response generated successfully",
        data: {
          question,
          answer,
          relevantChunks: chunkIndices,
          chatHistoryId: chatHistory._id.toString(),
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public explainConcept = async (
    body: { documentId: string; concept: string },
    userId: string
  ) => {
    try {
      const { documentId, concept } = body;
      if (!documentId || !concept)
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Document ID and concept are required",
        };

      const document = await documentRepository.findDocument({
        _id: documentId,
        userId: new mongoose.Types.ObjectId(userId),
        status: DocumentStatus.READY,
      });

      if (!document)
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Document not found or not ready",
        };

      const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
      const context = relevantChunks.map((chunk) => chunk.content).join("\n\n");

      const explanation = await explainConcept(concept, context);

      const relevantChunksIndices = relevantChunks.map(
        (chunk) => chunk.chunkIndex
      );

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Concept explained successfully",
        data: {
          concept,
          explanation,
          relevantChunks: relevantChunksIndices,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public getChatHistory = async (
    documentId: string,
    userId: string
  ): Promise<Response<ChatHistoryEntity["messages"]>> => {
    try {
      if (!documentId)
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Document ID is required",
        };

      const chatHistory = await ChatHistory.findOne({
        documentId: new mongoose.Types.ObjectId(documentId),
        userId: new mongoose.Types.ObjectId(userId),
      }).select("messages");

      if (!chatHistory)
        return {
          success: false,
          statusCode: STATUS_CODES.NOT_FOUND,
          message: "Chat history not found",
          data: [] as unknown as ChatHistoryEntity["messages"],
        };

      return {
        success: true,
        statusCode: STATUS_CODES.OK,
        message: "Chat history fetched successfully",
        data: chatHistory.messages,
      };
    } catch (error) {
      throw error;
    }
  };
}

export default new AiService();
