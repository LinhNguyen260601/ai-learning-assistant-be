export interface ValidationErrorItem {
  message: string;
}

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  code?: number | string;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, ValidationErrorItem>;
}
