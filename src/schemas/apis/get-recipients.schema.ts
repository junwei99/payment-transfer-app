import { z } from "zod";
import {
  EMPTY_REQUEST,
  ERROR_RESPONSE,
  NONBLANK,
  RECIPIENT,
} from "@/schemas/common.schema";

export const GET_RECIPIENTS_REQ_SCHEMA = EMPTY_REQUEST;

export const GET_RECIPIENTS_RES_SCHEMA = z.array(
  RECIPIENT.extend({ id: NONBLANK }),
);

export const GET_RECIPIENTS_ERR_RESPONSE_SCHEMA = ERROR_RESPONSE;

export const GET_RECIPIENTS_API_SCHEMA = {
  request: GET_RECIPIENTS_REQ_SCHEMA,
  successResponse: GET_RECIPIENTS_RES_SCHEMA,
  errResponse: GET_RECIPIENTS_ERR_RESPONSE_SCHEMA,
};
