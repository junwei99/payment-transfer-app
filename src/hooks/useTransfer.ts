import {
  ACCOUNT_OPTIONS,
  isDefinitiveRejection,
  RECIPIENTS_OPTIONS,
  transferOptions,
  unwrap,
} from "@/query/banking";
import { bankingService } from "@/services/index.services";
import { useTransferStore } from "@/stores/transfer";
import type { TReviewedTransfer, TSubmission } from "@/types/transfer.types";

import {
  onlineManager,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";

const requireOnline = () => {
  if (!onlineManager.isOnline()) {
    throw new Error("You’re offline. Connect and try again.");
  }
};

export const useReviewTransfer = () => {
  const client = useQueryClient();

  return () => {
    const account = client.getQueryData(ACCOUNT_OPTIONS.queryKey);

    if (!account) {
      return false;
    }

    const recipients = client.getQueryData(RECIPIENTS_OPTIONS.queryKey) ?? [];

    return useTransferStore.getState().review(account.currency, recipients);
  };
};

export const useSubmitTransfer = () => {
  const client = useQueryClient();

  const approval = useMutation({
    mutationFn: (details: TReviewedTransfer) => {
      requireOnline();

      return unwrap(bankingService.authorizeTransfer(details));
    },
    retry: false,
    networkMode: "always",
    gcTime: 0,
  });

  const submission = useMutation({
    mutationFn: (body: TSubmission) => {
      requireOnline();

      return unwrap(bankingService.submitTransfer(body));
    },
    retry: false,
    networkMode: "always",
    gcTime: 0,
  });

  const transfer = async () => {
    const { reviewed, pending, completedId } = useTransferStore.getState();

    if (!reviewed || pending || completedId) {
      return;
    }

    useTransferStore.setState({ pending: true, issue: null });

    try {
      requireOnline();

      let body = useTransferStore.getState().unresolved;

      if (!body) {
        const approved = await approval.mutateAsync(reviewed);

        body = {
          ...reviewed,
          recipient: { ...reviewed.recipient },
          approvalId: approved.approvalId,
          idempotencyKey: randomUUID(),
        };

        useTransferStore.setState({ unresolved: body });
      }

      const completed = await submission.mutateAsync(body);

      client.setQueryData(transferOptions(completed.id).queryKey, completed);

      useTransferStore.setState({
        unresolved: null,
        completedId: completed.id,
      });

      void client.invalidateQueries({ queryKey: ACCOUNT_OPTIONS.queryKey });
    } catch (error) {
      if (
        useTransferStore.getState().unresolved &&
        !isDefinitiveRejection(error)
      ) {
        useTransferStore.setState({
          issue: "We couldn't confirm whether this transfer completed.",
        });
      } else {
        useTransferStore.setState({
          unresolved: null,
          issue:
            error instanceof Error
              ? error.message
              : "Unable to approve the transfer. Try again.",
        });
      }
    } finally {
      approval.reset();
      submission.reset();

      useTransferStore.setState({ pending: false });
    }
  };

  return transfer;
};
