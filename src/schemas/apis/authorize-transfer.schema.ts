import { z } from "zod";

import {
  ERROR_RESPONSE,
  NONBLANK,
  TRANSFER_DETAILS,
} from "@/schemas/common.schema";

export const AUTHORIZE_TRANSFER_REQ_SCHEMA = TRANSFER_DETAILS;

export const AUTHORIZE_TRANSFER_RES_SCHEMA = z.object({
  approvalId: NONBLANK,
  expiresAt: z.iso.datetime(),
});

export const AUTHORIZE_TRANSFER_ERR_RESPONSE_SCHEMA = ERROR_RESPONSE;

export const AUTHORIZE_TRANSFER_API_SCHEMA = {
  request: AUTHORIZE_TRANSFER_REQ_SCHEMA,
  successResponse: AUTHORIZE_TRANSFER_RES_SCHEMA,
  errResponse: AUTHORIZE_TRANSFER_ERR_RESPONSE_SCHEMA,
};
