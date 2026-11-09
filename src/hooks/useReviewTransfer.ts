import { ACCOUNT_OPTIONS, RECIPIENTS_OPTIONS } from "@/query/banking";
import type { TTransferFormOutput } from "@/schemas/transfer-form.schema";
import { useTransferStore } from "@/stores/transfer";
import { getRecipientDraftSelection } from "@/utils/transfer-form.utils";
import { selectRecipientSelection } from "@/utils/transfer.utils";
import { useQueryClient } from "@tanstack/react-query";

export const useReviewTransfer = () => {
  const client = useQueryClient();

  return (values: TTransferFormOutput) => {
    const account = client.getQueryData(ACCOUNT_OPTIONS.queryKey);

    const selection = selectRecipientSelection(
      getRecipientDraftSelection(values),
      client.getQueryData(RECIPIENTS_OPTIONS.queryKey),
    );

    if (
      !account ||
      (selection.kind !== "MANUAL" && selection.kind !== "SAVED")
    ) {
      return false;
    }

    const recipient =
      selection.kind === "MANUAL"
        ? { name: values.name.trim(), account: values.account.trim() }
        : { name: selection.name.trim(), account: selection.account };

    return useTransferStore.getState().dispatch({
      type: "REVIEW",
      details: {
        recipient,
        amountMinor: values.amount,
        currency: account.currency,
        note: values.note,
      },
    });
  };
};
