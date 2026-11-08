import { z } from "zod";
import {
  emptyRequest,
  errorResponse,
  nonblank,
  recipient,
} from "@/schemas/common.schema";

export const getRecipientsReqSchema = emptyRequest;

export const getRecipientsResSchema = z.array(
  recipient.extend({ id: nonblank }),
);

export const getRecipientsErrResponseSchema = errorResponse;

export const getRecipientsApiSchema = {
  request: getRecipientsReqSchema,
  successResponse: getRecipientsResSchema,
  errResponse: getRecipientsErrResponseSchema,
};
