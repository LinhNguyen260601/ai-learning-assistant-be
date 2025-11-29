import type { StatusCode } from "./statusCode.type";

export interface Response<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode: StatusCode;
}
