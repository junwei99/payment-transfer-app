import { z } from "zod";
import {
  ERROR_RESPONSE,
  NONBLANK,
  TRANSFER_DETAILS,
} from "@/schemas/common.schema";

export const TRANSFER_AUTHENTICATION_SCHEMA = z.discriminatedUnion("method", [
  z.object({ method: z.literal("biometric"), success: z.literal(true) }),
  z.object({ method: z.literal("pin"), pin: z.string().regex(/^\d{6}$/) }),
]);

export const AUTHORIZE_TRANSFER_REQ_SCHEMA = TRANSFER_DETAILS.extend({
  authentication: TRANSFER_AUTHENTICATION_SCHEMA,
});

export const AUTHORIZE_TRANSFER_RES_SCHEMA = z.object({
  approvalId: NONBLANK,
  expiresAt: z.iso.datetime(),
});

export const AUTHORIZE_TRANSFER_ERR_RESPONSE_SCHEMA = ERROR_RESPONSE.extend({
  error: ERROR_RESPONSE.shape.error.extend({
    retryAt: z.iso.datetime().optional(),
  }),
});

export const AUTHORIZE_TRANSFER_API_SCHEMA = {
  request: AUTHORIZE_TRANSFER_REQ_SCHEMA,
  successResponse: AUTHORIZE_TRANSFER_RES_SCHEMA,
  errResponse: AUTHORIZE_TRANSFER_ERR_RESPONSE_SCHEMA,
};
