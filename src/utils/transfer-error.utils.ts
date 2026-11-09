import type { TTransferFailure } from "@/types/transfer.types";

export const getRejectionMessage = (error: TTransferFailure | null) => {
  if (error?.kind === "api-error") {
    switch (error.error.error.code) {
      case "AUTHENTICATION_CANCELLED":
        return "Authentication was cancelled. Try again when you're ready.";

      case "AUTHENTICATION_UNAVAILABLE":
        return "Authentication is unavailable. Try again.";

      case "VALIDATION_ERROR":
        return "Check your transfer details and try again.";

      case "APPROVAL_INVALID":
      case "APPROVAL_CONSUMED":
        return "Your transfer approval is no longer valid. Authenticate again.";

      case "APPROVAL_MISMATCH":
        return "Your transfer details do not match the approval. Review them and authenticate again.";

      case "INSUFFICIENT_FUNDS":
        return "You don't have enough available balance for this transfer. Edit the amount and try again.";

      default:
        return "Unable to approve the transfer. Try again.";
    }
  }

  if (error?.kind === "transport-error") {
    switch (error.reason) {
      case "network":
        return "Couldn't connect to approve the transfer. Check your connection and try again.";

      case "timeout":
        return "Transfer approval timed out. Try again.";

      case "cancelled":
        return "Transfer approval was cancelled. Try again when you're ready.";
    }
  }

  if (error?.kind === "parse-error") {
    return "Couldn't read the transfer approval response. Try again.";
  }

  return "Unable to approve the transfer. Try again.";
};
