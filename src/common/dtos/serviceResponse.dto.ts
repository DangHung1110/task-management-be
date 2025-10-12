import { z } from "zod";

export enum ResponseStatus {
  Success,
  Failed,
}

export class ServiceResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
  code: number;

  constructor(status: ResponseStatus, message: string, data: T, code: number) {
    this.success = status === ResponseStatus.Success;
    this.message = message;
    this.data = data;
    this.code = code;
  }
}

export const ServiceResponseSchema = (dataSchema: any | null) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    summary: dataSchema && typeof dataSchema?.optional === 'function' ? dataSchema.optional() : z.any().nullable(),
    code: z.number(),
  });