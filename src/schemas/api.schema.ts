import { z } from "zod";

import { AUTHORIZE_TRANSFER_API_SCHEMA } from "@/schemas/apis/authorize-transfer.schema";
import { GET_ACCOUNT_API_SCHEMA } from "@/schemas/apis/get-account.schema";
import { GET_RECIPIENTS_API_SCHEMA } from "@/schemas/apis/get-recipients.schema";
import { GET_TRANSFER_API_SCHEMA } from "@/schemas/apis/get-transfer.schema";
import { SUBMIT_TRANSFER_API_SCHEMA } from "@/schemas/apis/submit-transfer.schema";

export const API_SCHEMA = {
  "/account": GET_ACCOUNT_API_SCHEMA,
  "/recipients": GET_RECIPIENTS_API_SCHEMA,
  "/transfer-authorizations": AUTHORIZE_TRANSFER_API_SCHEMA,
  "/transfers": SUBMIT_TRANSFER_API_SCHEMA,
  "/transfers/lookup": GET_TRANSFER_API_SCHEMA,
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

export type TGetApiEndpointResponse<T extends TApiEndpoints> = TApiResult<
  TGetApiEndpointSuccessResponse<T>,
  TGetApiEndpointErrorResponse<T>
>;

export type TApiResult<TSuccess, TFailure> =
  | { kind: "success"; data: TSuccess; status: number }
  | { kind: "api-error"; error: TFailure; status: number }
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
