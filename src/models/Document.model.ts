import { model, Schema } from "mongoose";
import { DocumentStatus } from "../types";

const documentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
    },
    filePath: {
      type: String,
      required: [true, "File path is required"],
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
    },
    extractedText: {
      type: String,
      default: "",
    },
    chunks: [
      {
        content: {
          type: String,
          required: [true, "Content is required"],
        },
        pageNumber: {
          type: Number,
          default: 0,
        },
        chunkIndex: {
          type: Number,
          required: [true, "Chunk index is required"],
        },
      },
    ],
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: [
        DocumentStatus.PROCESSING,
        DocumentStatus.READY,
        DocumentStatus.FAILED,
      ],
      default: DocumentStatus.PROCESSING,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ userId: 1, uploadDate: -1 });

const Document = model("Document", documentSchema);
export default Document;
