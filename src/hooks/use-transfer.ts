import {
  accountOptions,
  isDefinitiveRejection,
  recipientsOptions,
  transferOptions,
  unwrap,
} from "@/query/banking";
import { bankingService } from "@/services/index.services";
import { useTransferStore } from "@/stores/transfer";
import type { ReviewedTransfer, Submission } from "@/types/transfer.types";
import {
  onlineManager,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";

function requireOnline() {
  if (!onlineManager.isOnline())
    throw new Error("You’re offline. Connect and try again.");
}

export function useReviewTransfer() {
  const client = useQueryClient();
  return () => {
    const account = client.getQueryData(accountOptions.queryKey);
    if (!account) return false;
    const recipients = client.getQueryData(recipientsOptions.queryKey) ?? [];
    return useTransferStore.getState().review(account.currency, recipients);
  };
}

export function useSubmitTransfer() {
  const client = useQueryClient();

  const approval = useMutation({
    mutationFn: (details: ReviewedTransfer) => {
      requireOnline();
      return unwrap(bankingService.authorizeTransfer(details));
    },
    retry: false,
    networkMode: "always",
    gcTime: 0,
  });

  const submission = useMutation({
    mutationFn: (body: Submission) => {
      requireOnline();
      return unwrap(bankingService.submitTransfer(body));
    },
    retry: false,
    networkMode: "always",
    gcTime: 0,
  });

  async function transfer() {
    const { reviewed, pending, completedId } = useTransferStore.getState();

    if (!reviewed || pending || completedId) return;

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

      void client.invalidateQueries({ queryKey: accountOptions.queryKey });
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
  }

  return transfer;
}
