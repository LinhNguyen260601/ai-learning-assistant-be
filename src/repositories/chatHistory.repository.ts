import type { Document } from "mongoose";
import { ChatHistory } from "../models";
import type { ChatHistoryEntity, CreateChatHistoryDTO } from "../types";

class ChatHistoryRepository {
  public findChatHistory = async (
    payload: Partial<ChatHistoryEntity>
  ): Promise<(Document & ChatHistoryEntity) | null> =>
    await ChatHistory.findOne(payload);

  public createChatHistory = async (
    payload: CreateChatHistoryDTO
  ): Promise<ChatHistoryEntity> => {
    const chatHistory = await ChatHistory.create(payload);
    return chatHistory;
  };
}

export default new ChatHistoryRepository();
