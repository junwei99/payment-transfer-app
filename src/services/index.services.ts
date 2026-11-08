import { createRequestor } from "@/utils/requestor.utils";

const requestor = createRequestor();

const getAccount = requestor.createRequest("/account");

const getRecipients = requestor.createRequest("/recipients");

const authorizeTransfer = requestor.createRequest("/transfer-authorizations");

const submitTransfer = requestor.createRequest("/transfers");

const getTransfer = requestor.createRequest("/transfers/lookup");

export const bankingService = {
  getAccount,
  getRecipients,
  authorizeTransfer,
  submitTransfer,
  getTransfer,
};
