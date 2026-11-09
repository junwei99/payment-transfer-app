import {
  ACCOUNT_OPTIONS,
  AUTHORIZE_TRANSFER_OPTIONS,
  isDefinitiveRejection,
  ServiceError,
  SUBMIT_TRANSFER_OPTIONS,
  transferOptions,
} from "@/query/banking";
import { useTransferStore } from "@/stores/transfer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";

export const useSubmitTransfer = () => {
  const client = useQueryClient();

  const approval = useMutation(AUTHORIZE_TRANSFER_OPTIONS);
  const submission = useMutation(SUBMIT_TRANSFER_OPTIONS);

  const transfer = async () => {
    const { journey, dispatch } = useTransferStore.getState();
    const retry = journey.status === "UNRESOLVED";

    if (!dispatch({ type: retry ? "RETRY_SUBMISSION" : "START_APPROVAL" })) {
      return;
    }

    try {
      const pending = useTransferStore.getState().journey;

      if (pending.status === "APPROVING") {
        const approved = await approval.mutateAsync(pending.details);

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

      const submitting = useTransferStore.getState().journey;

      if (submitting.status !== "SUBMITTING") {
        return;
      }

      const completed = await submission.mutateAsync(submitting.submission);

      // Seed the receipt before completion redirects to its screen.
      client.setQueryData(transferOptions(completed.id).queryKey, completed);

      if (!dispatch({ type: "SUBMISSION_SUCCEEDED", id: completed.id })) {
        return;
      }

      void client.invalidateQueries({ queryKey: ACCOUNT_OPTIONS.queryKey });
    } catch (error) {
      const pending = useTransferStore.getState().journey;
      const failure = error instanceof ServiceError ? error.failure : null;

      if (pending.status === "APPROVING") {
        dispatch({ type: "APPROVAL_FAILED", error: failure });
      } else if (pending.status === "SUBMITTING") {
        if (isDefinitiveRejection(error)) {
          dispatch({ type: "SUBMISSION_REJECTED", error: failure });
        } else {
          dispatch({ type: "SUBMISSION_UNRESOLVED" });
        }
      }
    } finally {
      approval.reset();
      submission.reset();
    }
  };

  return transfer;
};
