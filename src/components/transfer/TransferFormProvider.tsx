import { RECIPIENTS_OPTIONS } from "@/query/banking";
import {
  TRANSFER_FORM_SCHEMA,
  type TTransferFormOutput,
  type TTransferFormValues,
} from "@/schemas/transfer-form.schema";
import { selectTransferLocked, useTransferStore } from "@/stores/transfer";
import {
  EMPTY_TRANSFER_FORM,
  getRecipientDraftSelection,
} from "@/utils/transfer-form.utils";
import { selectRecipientSelection } from "@/utils/transfer.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, type PropsWithChildren } from "react";
import { FormProvider, useForm } from "react-hook-form";

const FIELD_ORDER = TRANSFER_FORM_SCHEMA.keyof().options;

const TRANSFER_RESOLVER = zodResolver(TRANSFER_FORM_SCHEMA, undefined, {
  mode: "sync",
});

export const TransferFormProvider = ({ children }: PropsWithChildren) => {
  const client = useQueryClient();

  const recipients = useQuery({ ...RECIPIENTS_OPTIONS, enabled: false });

  const methods = useForm<TTransferFormValues, undefined, TTransferFormOutput>({
    defaultValues: EMPTY_TRANSFER_FORM,
    mode: "all",
    shouldUnregister: false,
    resolver: (values, context, options) => {
      const selection = selectRecipientSelection(
        getRecipientDraftSelection(values),
        client.getQueryData(RECIPIENTS_OPTIONS.queryKey),
      );

      return TRANSFER_RESOLVER(
        { ...values, recipient: selection.kind },
        context,
        options,
      );
    },
  });

  const { register, trigger } = methods;

  // Schema key order keeps error focus consistent for conditionally mounted controls.
  for (const name of FIELD_ORDER) {
    register(name);
  }

  /**
   *
   * Cache updates don't trigger React hook form validation. Revalidate when recipients change
   * so a removed or restored recipient updates the error, unless the transfer is locked.
   *
   */
  useEffect(() => {
    if (!selectTransferLocked(useTransferStore.getState())) {
      void trigger();
    }
  }, [recipients.data, trigger]);

  return <FormProvider {...methods}>{children}</FormProvider>;
};
