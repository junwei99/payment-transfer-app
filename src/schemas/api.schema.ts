import { z } from "zod";
import { authorizeTransferApiSchema } from "@/schemas/apis/authorize-transfer.schema";
import { getAccountApiSchema } from "@/schemas/apis/get-account.schema";
import { getRecipientsApiSchema } from "@/schemas/apis/get-recipients.schema";
import { getTransferApiSchema } from "@/schemas/apis/get-transfer.schema";
import { submitTransferApiSchema } from "@/schemas/apis/submit-transfer.schema";

export const API_SCHEMA = {
  "/account": getAccountApiSchema,
  "/recipients": getRecipientsApiSchema,
  "/transfer-authorizations": authorizeTransferApiSchema,
  "/transfers": submitTransferApiSchema,
  "/transfers/lookup": getTransferApiSchema,
} as const satisfies Record<
  string,
  { request: z.ZodType; successResponse: z.ZodType; errResponse: z.ZodType }
>;

export type TApiEndpoints = keyof typeof API_SCHEMA;
type TApiEndpointSchema<T extends TApiEndpoints> = (typeof API_SCHEMA)[T];

export const getApiSchema = <T extends TApiEndpoints>(endpoint: T) =>
  API_SCHEMA[endpoint];

export const getResponseSchema = <T extends TApiEndpoints>(endpoint: T) => {
  const schema = getApiSchema(endpoint);
  return { success: schema.successResponse, error: schema.errResponse };
};

export type TGetApiEndpointRequest<T extends TApiEndpoints> = z.input<
  TApiEndpointSchema<T>["request"]
>;
export type TGetApiEndpointSuccessResponse<T extends TApiEndpoints> = z.output<
  TApiEndpointSchema<T>["successResponse"]
>;
export type TGetApiEndpointErrorResponse<T extends TApiEndpoints> = z.output<
  TApiEndpointSchema<T>["errResponse"]
>;
export type TGetApiEndpointResponse<T extends TApiEndpoints> = ApiResult<
  TGetApiEndpointSuccessResponse<T>,
  TGetApiEndpointErrorResponse<T>
>;

export type ApiResult<Success, Failure> =
  | { kind: "success"; data: Success; status: number }
  | { kind: "api-error"; error: Failure; status: number }
  | {
      kind: "parse-error";
      expected: "success" | "error";
      issues: z.core.$ZodIssue[];
      status: number;
    }
  | {
      kind: "transport-error";
      reason: "timeout" | "cancelled" | "network";
      message: string;
    };
