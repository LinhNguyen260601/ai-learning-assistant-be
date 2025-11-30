import type { InferSchemaType, Types } from "mongoose";
import type { Document } from "../models";

export enum DocumentStatus {
  PROCESSING = "processing",
  READY = "ready",
  FAILED = "failed",
}

export type DocumentEntity = Omit<
  InferSchemaType<typeof Document.schema>,
  "createdAt" | "updatedAt"
> & { _id: string | Types.ObjectId };
