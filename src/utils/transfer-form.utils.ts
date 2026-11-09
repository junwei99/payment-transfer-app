import type { TTransferFormValues } from "@/schemas/transfer-form.schema";
import type { TRecipientDraftSelection } from "@/types/transfer.types";

export const EMPTY_TRANSFER_FORM: TTransferFormValues = {
  recipient: "NONE",
  recipientId: "",
  name: "",
  account: "",
  amount: "",
  note: "",
};

export const getRecipientDraftSelection = (
  values: Pick<TTransferFormValues, "recipient" | "recipientId">,
): TRecipientDraftSelection => {
  if (values.recipient === "SAVED" || values.recipient === "MISSING") {
    return { kind: "SAVED", recipientId: values.recipientId };
  }

  return { kind: values.recipient };
};
