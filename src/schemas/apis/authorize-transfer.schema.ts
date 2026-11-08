import { z } from "zod";
import {
  errorResponse,
  nonblank,
  transferDetails,
} from "@/schemas/common.schema";

export const authorizeTransferReqSchema = transferDetails;

export const authorizeTransferResSchema = z.object({
  approvalId: nonblank,
  expiresAt: z.iso.datetime(),
});

export const authorizeTransferErrResponseSchema = errorResponse;

export const authorizeTransferApiSchema = {
  request: authorizeTransferReqSchema,
  successResponse: authorizeTransferResSchema,
  errResponse: authorizeTransferErrResponseSchema,
};
