import { z } from "zod";
import {
  completedTransfer,
  errorResponse,
  nonblank,
} from "@/schemas/common.schema";

export const getTransferReqSchema = z.object({ id: nonblank });

export const getTransferResSchema = completedTransfer;

export const getTransferErrResponseSchema = errorResponse;

export const getTransferApiSchema = {
  request: getTransferReqSchema,
  successResponse: getTransferResSchema,
  errResponse: getTransferErrResponseSchema,
};
