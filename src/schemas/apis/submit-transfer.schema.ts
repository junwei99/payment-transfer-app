import {
  completedTransfer,
  errorResponse,
  nonblank,
  transferDetails,
} from "@/schemas/common.schema";

export const submitTransferReqSchema = transferDetails.extend({
  approvalId: nonblank,
  idempotencyKey: nonblank.max(200),
});

export const submitTransferResSchema = completedTransfer;

export const submitTransferErrResponseSchema = errorResponse;

export const submitTransferApiSchema = {
  request: submitTransferReqSchema,
  successResponse: submitTransferResSchema,
  errResponse: submitTransferErrResponseSchema,
};
