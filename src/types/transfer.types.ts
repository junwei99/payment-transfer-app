import type { TGetApiEndpointRequest } from "@/schemas/api.schema";

export type TTransferDraft = {
  recipientId: string | null;
  manual: boolean;
  name: string;
  account: string;
  amount: string;
  note: string;
};

export type TReviewedTransfer =
  TGetApiEndpointRequest<"/transfer-authorizations">;

export type TSubmission = TGetApiEndpointRequest<"/transfers">;

export type TTransferDetails = {
  name: string;
  account: string;
  amount: string;
  currency: string;
  note: string;
};

export type TFieldErrors = {
  recipient?: string;
  amount?: string;
  note?: string;
};
