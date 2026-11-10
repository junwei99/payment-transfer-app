import {
  ACCOUNT_OPTIONS,
  isDefinitiveRejection,
  SUBMIT_TRANSFER_OPTIONS,
  transferOptions,
} from "@/query/banking";
import { bankingService } from "@/services/index.services";
import { usePinAttempts } from "@/stores/pin-attempts";
import { useTransferStore } from "@/stores/transfer";
import type {
  TReviewedTransfer,
  TTransferAuthentication,
} from "@/types/transfer.types";
import { ServiceError } from "@/utils/service-error.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useCallback, useRef } from "react";

export const useSubmitTransfer = () => {
  const client = useQueryClient();

  const credentials = useRef<TTransferAuthentication | null>(null);

  const { mutateAsync: approve, reset: resetApproval } = useMutation({
    mutationFn: (details: TReviewedTransfer) => {
      // Keep credentials out of Query mutation variables and journey state.
      const authentication = credentials.current;
      credentials.current = null;

      if (!authentication) {
        throw new Error("Transfer authentication is required.");
      }

      return bankingService.authorizeTransfer({ ...details, authentication });
    },
    retry: false,
    networkMode: "always",
    gcTime: 0,
  });

  const { mutateAsync: submit, reset: resetSubmission } = useMutation(
    SUBMIT_TRANSFER_OPTIONS,
  );

  const transfer = useCallback(
    async (attemptId?: string, authentication?: TTransferAuthentication) => {
      const { journey, dispatch } = useTransferStore.getState();

      if (journey.status === "UNRESOLVED") {
        if (!dispatch({ type: "RETRY_SUBMISSION" })) {
          return;
        }
      } else {
        if (attemptId === undefined || authentication === undefined) {
          return;
        }

        if (!dispatch({ type: "START_APPROVAL", attemptId })) {
          return;
        }
      }

      try {
        const approvalJourney = useTransferStore.getState().journey;

        if (approvalJourney.status === "APPROVING" && authentication) {
          const isPinAuthentication = authentication.method === "pin";

          credentials.current = authentication;
          authentication = undefined;

          const approved = await approve(approvalJourney.details);

          if (isPinAuthentication) {
            usePinAttempts.getState().reset();
          }

          if (
            !dispatch({
              type: "APPROVAL_SUCCEEDED",
              approvalId: approved.approvalId,
              idempotencyKey: randomUUID(),
            })
          ) {
            return;
          }
        }

        const submissionJourney = useTransferStore.getState().journey;

        if (submissionJourney.status !== "SUBMITTING") {
          return;
        }

        const completed = await submit(submissionJourney.submission);

        // Seed the receipt before completion redirects to its screen.
        client.setQueryData(transferOptions(completed.id).queryKey, completed);

        if (!dispatch({ type: "SUBMISSION_SUCCEEDED", id: completed.id })) {
          return;
        }

        void client.invalidateQueries({ queryKey: ACCOUNT_OPTIONS.queryKey });
      } catch (error) {
        const failedJourney = useTransferStore.getState().journey;
        const failure = error instanceof ServiceError ? error.failure : null;

        if (failedJourney.status === "APPROVING") {
          if (
            failure?.kind === "api-error" &&
            ["PIN_INCORRECT", "PIN_LOCKED"].includes(failure.error.error.code)
          ) {
            dispatch({
              type: "PIN_REJECTED",
              attemptId: failedJourney.attemptId,
            });

            return failure;
          }

          dispatch({ type: "APPROVAL_FAILED", error: failure });

          return;
        }

        if (failedJourney.status !== "SUBMITTING") {
          return;
        }

        if (isDefinitiveRejection(error)) {
          dispatch({ type: "SUBMISSION_REJECTED", error: failure });
        } else {
          dispatch({ type: "SUBMISSION_UNRESOLVED" });
        }
      } finally {
        credentials.current = null;
        resetApproval();
        resetSubmission();
      }
    },
    [client, approve, submit, resetApproval, resetSubmission],
  );

  return transfer;
};
