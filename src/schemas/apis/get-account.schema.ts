import {
  accountSchema,
  emptyRequest,
  errorResponse,
} from "@/schemas/common.schema";

export const getAccountReqSchema = emptyRequest;

export const getAccountResSchema = accountSchema;

export const getAccountErrResponseSchema = errorResponse;

export const getAccountApiSchema = {
  request: getAccountReqSchema,
  successResponse: getAccountResSchema,
  errResponse: getAccountErrResponseSchema,
};
