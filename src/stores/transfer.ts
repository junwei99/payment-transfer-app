import type { TGetApiEndpointSuccessResponse } from "@/schemas/api.schema";
import type {
  TFieldErrors,
  TReviewedTransfer,
  TSubmission,
  TTransferDraft,
} from "@/types/transfer.types";
import { parseAmount } from "@/utils/transfer.utils";

import type { SetStateAction } from "react";
import { create } from "zustand";

type TRecipients = TGetApiEndpointSuccessResponse<"/recipients">;

type TTransferState = {
  draft: TTransferDraft;
  reviewed: TReviewedTransfer | null;
  completedId: string | null;
  pending: boolean;
  unresolved: TSubmission | null;
  fieldErrors: TFieldErrors;
  issue: string | null;
  setDraft: (value: SetStateAction<TTransferDraft>) => void;
  review: (
    currency: TReviewedTransfer["currency"],
    recipients: TRecipients,
  ) => boolean;
  reset: () => void;
};

const emptyDraft = (): TTransferDraft => {
  return {
    recipientId: null,
    manual: false,
    name: "",
    account: "",
    amount: "",
    note: "",
  };
};

export const useTransferStore = create<TTransferState>()((set, get) => ({
  draft: emptyDraft(),
  reviewed: null,
  completedId: null,
  pending: false,
  unresolved: null,
  fieldErrors: {},
  issue: null,

  setDraft: (value) => {
    const { pending, unresolved, draft } = get();

    if (pending || unresolved) {
      return;
    }

    set({
      draft: typeof value === "function" ? value(draft) : value,
      reviewed: null,
      completedId: null,
      issue: null,
      fieldErrors: {},
    });
  },

  review: (currency, recipients) => {
    const { pending, unresolved, draft } = get();

    if (pending || unresolved) {
      return false;
    }

    const recipient = draft.manual
      ? { name: draft.name.trim(), account: draft.account.trim() }
      : recipients.find(({ id }) => id === draft.recipientId);

    const amountMinor = parseAmount(draft.amount);

    const errors: TFieldErrors = {};

    if (!recipient?.name.trim() || !/^\d{10}$/.test(recipient.account)) {
      errors.recipient =
        "Enter a recipient name and a ten-digit account number, or choose a recipient.";
    }

    if (amountMinor === null) {
      errors.amount =
        "Enter a positive amount with at most two decimal places within the supported limit.";
    }

    if (draft.note.length > 200) {
      errors.note = "Use at most 200 characters for the note.";
    }

    set({ fieldErrors: errors, issue: null, completedId: null });

    if (Object.keys(errors).length || !recipient || amountMinor === null) {
      return false;
    }

    set({
      reviewed: {
        recipient: { name: recipient.name.trim(), account: recipient.account },
        amountMinor,
        currency,
        note: draft.note,
      },
    });

    return true;
  },

  reset: () => {
    if (get().pending || get().unresolved) {
      return;
    }

    set({
      draft: emptyDraft(),
      reviewed: null,
      completedId: null,
      fieldErrors: {},
      issue: null,
    });
  },
}));

export const selectTransferLocked = (state: TTransferState) =>
  state.pending || state.unresolved !== null;
