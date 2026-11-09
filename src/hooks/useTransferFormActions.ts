import type {
  TTransferFormOutput,
  TTransferFormValues,
} from "@/schemas/transfer-form.schema";
import { useTransferStore } from "@/stores/transfer";
import type { TRecipientDraftSelection } from "@/types/transfer.types";
import { EMPTY_TRANSFER_FORM } from "@/utils/transfer-form.utils";
import { useFormContext } from "react-hook-form";

export const useTransferFormActions = () => {
  const { getValues, setValue, trigger, reset } = useFormContext<
    TTransferFormValues,
    undefined,
    TTransferFormOutput
  >();

  const selectRecipient = (selection: TRecipientDraftSelection) => {
    const state = useTransferStore.getState();

    const recipientId = selection.kind === "SAVED" ? selection.recipientId : "";

    if (
      getValues("recipient") === selection.kind &&
      getValues("recipientId") === recipientId
    ) {
      return;
    }

    if (!state.dispatch({ type: "INVALIDATE_REVIEW" })) {
      return;
    }

    setValue("recipientId", recipientId, { shouldDirty: true });
    setValue("recipient", selection.kind, {
      shouldDirty: true,
      shouldTouch: true,
    });

    // Clear or restore conditional manual errors without changing their interaction history.
    void trigger();
  };

  const resetTransfer = () => {
    const state = useTransferStore.getState();

    if (!state.dispatch({ type: "RESET" })) {
      return;
    }

    reset(EMPTY_TRANSFER_FORM);
  };

  return {
    selectRecipient,
    resetTransfer,
  };
};
