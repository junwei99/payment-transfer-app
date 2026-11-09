import type { TGetApiEndpointSuccessResponse } from "@/schemas/api.schema";
import type {
  TRecipientSelection,
  TReviewedTransfer,
  TTransferDetails,
  TRecipientDraftSelection,
} from "@/types/transfer.types";

export const formatMinor = (minor: number) => {
  const digits = String(minor).padStart(3, "0");
  return `${digits.slice(0, -2)}.${digits.slice(-2)}`;
};

export const MAX_AMOUNT_INPUT_LENGTH = 20;

export const parseAmount = (value: string): number | null => {
  const amount = value.trim();

  // Bound conversion work even for a very large pasted value.
  if (
    amount.length > MAX_AMOUNT_INPUT_LENGTH ||
    !/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(amount)
  ) {
    return null;
  }

  const [whole, fraction = ""] = amount.split(".");
  const minor = BigInt(whole || "0") * 100n + BigInt(fraction.padEnd(2, "0"));

  return minor > 0n && minor <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(minor)
    : null;
};

export const displayDetails = (
  details: TReviewedTransfer,
): TTransferDetails => {
  return {
    name: details.recipient.name,
    account: details.recipient.account,
    amount: formatMinor(details.amountMinor),
    currency: details.currency,
    note: details.note ?? "",
  };
};

/**
 *
 * NONE: no selection or saved recipients not loaded.
 *
 * MANUAL: use the manually inputted name and account.
 *
 * SAVED: selected ID found; returns name and account.
 *
 * MISSING: selected ID absent from the loaded list; returns its ID.
 * The draft keeps the ID, so a returning recipient resolves as SAVED.
 *
 */
export const selectRecipientSelection = (
  recipientSelection: TRecipientDraftSelection,
  recipients: TGetApiEndpointSuccessResponse<"/recipients"> | undefined,
): TRecipientSelection => {
  if (recipientSelection.kind !== "SAVED") {
    return recipientSelection;
  }

  if (!recipients) {
    return { kind: "NONE" };
  }

  const recipient = recipients.find(
    ({ id }) => id === recipientSelection.recipientId,
  );

  if (!recipient) {
    return { kind: "MISSING", recipientId: recipientSelection.recipientId };
  }

  return {
    kind: "SAVED",
    name: recipient.name,
    account: recipient.account,
  };
};
