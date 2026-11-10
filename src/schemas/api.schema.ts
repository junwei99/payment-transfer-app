import { AUTHORIZE_TRANSFER_API_SCHEMA } from "@/schemas/apis/authorize-transfer.schema";
import { GET_ACCOUNT_API_SCHEMA } from "@/schemas/apis/get-account.schema";
import { GET_RECIPIENTS_API_SCHEMA } from "@/schemas/apis/get-recipients.schema";
import { GET_TRANSFER_API_SCHEMA } from "@/schemas/apis/get-transfer.schema";
import { SUBMIT_TRANSFER_API_SCHEMA } from "@/schemas/apis/submit-transfer.schema";
import { z } from "zod";

export type TApiErrorResponse = {
  error: { code: string; message: string; retryAt?: string };
};

export type TApiResponseSchema<
  TSuccess = unknown,
  TError extends TApiErrorResponse = TApiErrorResponse,
> = {
  successResponse: z.ZodType<TSuccess>;
  errResponse: z.ZodType<TError>;
};

export const API_SCHEMA = {
  "/account": GET_ACCOUNT_API_SCHEMA,
  "/recipients": GET_RECIPIENTS_API_SCHEMA,
  "/transfer-authorizations": AUTHORIZE_TRANSFER_API_SCHEMA,
  "/transfers": SUBMIT_TRANSFER_API_SCHEMA,
  "/transfers/lookup": GET_TRANSFER_API_SCHEMA,
} as const satisfies Record<
  string,
  { request: z.ZodType } & TApiResponseSchema
>;

export type TApiEndpoints = keyof typeof API_SCHEMA;

export type TApiEndpointSchema<T extends TApiEndpoints = TApiEndpoints> =
  (typeof API_SCHEMA)[T];

export const getApiSchema = <T extends TApiEndpoints>(endpoint: T) =>
  API_SCHEMA[endpoint];

export type TApiSchemaRequest<TSchema extends TApiEndpointSchema> = z.input<
  TSchema["request"]
>;

export type TGetApiEndpointRequest<T extends TApiEndpoints> = z.input<
  TApiEndpointSchema<T>["request"]
>;

export type TGetApiEndpointSuccessResponse<T extends TApiEndpoints> = z.output<
  TApiEndpointSchema<T>["successResponse"]
>;

export type TGetApiEndpointErrorResponse<T extends TApiEndpoints> = z.output<
  TApiEndpointSchema<T>["errResponse"]
>;

export type TGetApiEndpointFailure<T extends TApiEndpoints> = TApiFailure<
  TGetApiEndpointErrorResponse<T>
>;

export type TApiFailure<
  TFailure extends TApiErrorResponse = TApiErrorResponse,
> =
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

export type TApiSchemaResponse<TSchema extends TApiResponseSchema> = z.output<
  TSchema["successResponse"]
>;
