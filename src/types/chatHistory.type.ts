import type { InferSchemaType, Types } from "mongoose";
import type { ChatHistory } from "../models";

export type ChatHistoryEntity = Omit<
  InferSchemaType<typeof ChatHistory.schema>,
  "createdAt" | "updatedAt"
> & { _id: string | Types.ObjectId };

export interface CreateChatHistoryDTO {
  userId: string;
  documentId: string;
  messages: {
    role: "user" | "assistant";
    content: string;
    relevantChunks: number[];
  }[];
}
