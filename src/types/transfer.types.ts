import type { TGetApiEndpointRequest } from "@/schemas/api.schema";

export type TransferDraft = {
  recipientId: string | null;
  manual: boolean;
  name: string;
  account: string;
  amount: string;
  note: string;
};

export type ReviewedTransfer =
  TGetApiEndpointRequest<"/transfer-authorizations">;
export type Submission = TGetApiEndpointRequest<"/transfers">;
export type TransferDetails = {
  name: string;
  account: string;
  amount: string;
  currency: string;
  note: string;
};
export type FieldErrors = {
  recipient?: string;
  amount?: string;
  note?: string;
};
