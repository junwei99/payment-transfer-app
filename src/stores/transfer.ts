import type {
  TReviewedTransfer,
  TTransferFailure,
  TTransferJourney,
} from "@/types/transfer.types";
import { create } from "zustand";

type TTransferAction =
  | { type: "REVIEW"; details: TReviewedTransfer }
  | { type: "INVALIDATE_REVIEW" }
  | { type: "RESET" }
  | { type: "START_APPROVAL" }
  | {
      type: "APPROVAL_SUCCEEDED";
      approvalId: string;
      idempotencyKey: string;
    }
  | { type: "APPROVAL_FAILED"; error: TTransferFailure | null }
  | { type: "RETRY_SUBMISSION" }
  | { type: "SUBMISSION_SUCCEEDED"; id: string }
  | { type: "SUBMISSION_REJECTED"; error: TTransferFailure | null }
  | { type: "SUBMISSION_UNRESOLVED" };

type TTransferState = {
  journey: TTransferJourney;
  dispatch: (action: TTransferAction) => boolean;
};

export const selectTransferLocked = (state: { journey: TTransferJourney }) =>
  state.journey.status === "APPROVING" ||
  state.journey.status === "SUBMITTING" ||
  state.journey.status === "UNRESOLVED";

const transitionJourney = (
  journey: TTransferJourney,
  action: TTransferAction,
): TTransferJourney | null => {
  switch (action.type) {
    case "REVIEW": {
      if (selectTransferLocked({ journey })) {
        return null;
      }

      return { status: "REVIEWED", details: action.details };
    }
    case "INVALIDATE_REVIEW":
    case "RESET": {
      if (selectTransferLocked({ journey })) {
        return null;
      }

      return { status: "IDLE" };
    }
    case "START_APPROVAL": {
      if (journey.status !== "REVIEWED" && journey.status !== "REJECTED") {
        return null;
      }

      return { status: "APPROVING", details: journey.details };
    }
    case "APPROVAL_SUCCEEDED": {
      if (journey.status !== "APPROVING") {
        return null;
      }

      return {
        status: "SUBMITTING",
        submission: {
          ...journey.details,
          recipient: { ...journey.details.recipient },
          approvalId: action.approvalId,
          idempotencyKey: action.idempotencyKey,
        },
      };
    }
    case "APPROVAL_FAILED": {
      if (journey.status !== "APPROVING") {
        return null;
      }

      return {
        status: "REJECTED",
        details: journey.details,
        error: action.error,
      };
    }
    case "RETRY_SUBMISSION": {
      if (journey.status !== "UNRESOLVED") {
        return null;
      }

      return { status: "SUBMITTING", submission: journey.submission };
    }
    case "SUBMISSION_SUCCEEDED": {
      if (journey.status !== "SUBMITTING") {
        return null;
      }

      return { status: "COMPLETED", id: action.id };
    }
    case "SUBMISSION_REJECTED": {
      if (journey.status !== "SUBMITTING") {
        return null;
      }

      const { recipient, amountMinor, currency, note } = journey.submission;

      return {
        status: "REJECTED",
        details: { recipient: { ...recipient }, amountMinor, currency, note },
        error: action.error,
      };
    }
    case "SUBMISSION_UNRESOLVED": {
      if (journey.status !== "SUBMITTING") {
        return null;
      }

      return { status: "UNRESOLVED", submission: journey.submission };
    }
  }
};

const useWritableTransferStore = create<TTransferState>()((set, get) => ({
  journey: { status: "IDLE" },
  dispatch: (action) => {
    const journey = transitionJourney(get().journey, action);

    if (journey === null) {
      return false;
    }

    set({ journey });

    return true;
  },
}));

export const useTransferStore = Object.assign(
  <TSelected>(selector: (state: TTransferState) => TSelected) =>
    useWritableTransferStore(selector),
  {
    getState: useWritableTransferStore.getState,
    subscribe: useWritableTransferStore.subscribe,
  },
);
