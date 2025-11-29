import { model, Schema } from "mongoose";

const chatHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    documentId: {
      type: Schema.Types.ObjectId,
      required: [true, "Document ID is required"],
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: [true, "Role is required"],
        },
        content: {
          type: String,
          required: [true, "Content is required"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        relevantChunks: {
          type: [Number],
          default: [],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

chatHistorySchema.index({ userId: 1, documentId: 1 });

const ChatHistory = model("ChatHistory", chatHistorySchema);
export default ChatHistory;
