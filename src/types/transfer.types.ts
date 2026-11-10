import type {
  TGetApiEndpointRequest,
  TGetApiEndpointResponse,
} from "@/schemas/api.schema";

export type TRecipientDraftSelection =
  | { kind: "NONE" }
  | { kind: "SAVED"; recipientId: string }
  | { kind: "MANUAL" };

export type TReviewedTransfer = Omit<
  TGetApiEndpointRequest<"/transfer-authorizations">,
  "authentication"
>;

export type TTransferAuthentication =
  TGetApiEndpointRequest<"/transfer-authorizations">["authentication"];

export type TSubmission = TGetApiEndpointRequest<"/transfers">;

export type TTransferDetails = {
  name: string;
  account: string;
  amount: string;
  currency: string;
  note: string;
};

export type TRecipientSelection =
  | { kind: "MISSING"; recipientId: string }
  | { kind: "NONE" }
  | { kind: "MANUAL" }
  | { kind: "SAVED"; name: string; account: string };

export type TTransferFailure = Exclude<
  TGetApiEndpointResponse<"/transfers">,
  { kind: "success" }
>;

/**
 *
 * - IDLE: No reviewed transfer; the draft is editable.
 *
 * - REVIEWED: Ready for authentication; edits require another review.
 *
 * - AUTHENTICATING: One active attempt; edits blocked, cancellation returns to review.
 *
 * - APPROVING: Approval is pending; edits and navigation are blocked.
 *
 * - SUBMITTING: Sending the authorized request; edits and navigation are blocked.
 *
 * - UNRESOLVED: Payment may have completed; block edits and retry the same request.
 *   e.g. : The server processes the payment, but the response times out.
 *
 * - REJECTED: Approval failed or payment was rejected; allow edits or fresh approval.
 *
 * - COMPLETED: Payment succeeded; the ID identifies its receipt in the Query cache.
 *
 */
export type TTransferJourney =
  | { status: "IDLE" }
  | { status: "REVIEWED"; details: TReviewedTransfer }
  | {
      status: "AUTHENTICATING";
      details: TReviewedTransfer;
      attemptId: string;
      method: "biometric" | "pin";
    }
  | {
      status: "APPROVING";
      details: TReviewedTransfer;
      attemptId: string;
      method: "biometric" | "pin";
    }
  | { status: "SUBMITTING"; submission: TSubmission }
  | { status: "UNRESOLVED"; submission: TSubmission }
  | {
      status: "REJECTED";
      details: TReviewedTransfer;
      error: TTransferFailure | null;
    }
  | { status: "COMPLETED"; id: string };
