import { z } from "zod";
import {
  COMPLETED_TRANSFER,
  ERROR_RESPONSE,
  NONBLANK,
} from "@/schemas/common.schema";

export const GET_TRANSFER_REQ_SCHEMA = z.object({ id: NONBLANK });

export const GET_TRANSFER_RES_SCHEMA = COMPLETED_TRANSFER;

export const GET_TRANSFER_ERR_RESPONSE_SCHEMA = ERROR_RESPONSE;

export const GET_TRANSFER_API_SCHEMA = {
  request: GET_TRANSFER_REQ_SCHEMA,
  successResponse: GET_TRANSFER_RES_SCHEMA,
  errResponse: GET_TRANSFER_ERR_RESPONSE_SCHEMA,
};
