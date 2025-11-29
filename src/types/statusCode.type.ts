import { STATUS_CODES } from "../constants";

export type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];
