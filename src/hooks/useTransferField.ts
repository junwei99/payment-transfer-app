import type {
  TTransferField,
  TTransferFormOutput,
  TTransferFormValues,
} from "@/schemas/transfer-form.schema";
import { selectTransferLocked, useTransferStore } from "@/stores/transfer";
import { useController, useFormContext } from "react-hook-form";

export const useTransferField = (
  name: Exclude<TTransferField, "recipient">,
) => {
  const { field, fieldState, formState } = useController<
    TTransferFormValues,
    typeof name,
    TTransferFormOutput
  >({ name });

  const { getValues, getFieldState, setValue } = useFormContext<
    TTransferFormValues,
    undefined,
    TTransferFormOutput
  >();

  const locked = useTransferStore(selectTransferLocked);

  return {
    ref: field.ref,
    value: field.value,
    error:
      fieldState.isTouched || formState.isSubmitted
        ? fieldState.error?.message
        : undefined,
    editable: !locked,
    onChangeText: (value: string) => {
      const state = useTransferStore.getState();

      const isValueUnchanged = getValues(name) === value;

      const isManualRecipientField = name === "name" || name === "account";
      const isManualRecipientSelected = getValues("recipient") === "MANUAL";

      const isInactiveRecipientField =
        isManualRecipientField && !isManualRecipientSelected;

      if (isValueUnchanged || isInactiveRecipientField) {
        return;
      }

      if (!state.dispatch({ type: "INVALIDATE_REVIEW" })) {
        return;
      }

      field.onChange(value);

      // This flow treats the first edit as interaction, before the native blur.
      if (!getFieldState(name).isTouched) {
        setValue(name, value, { shouldTouch: true });
      }
    },
    onBlur: () => {
      if (selectTransferLocked(useTransferStore.getState())) {
        return;
      }

      field.onBlur();
    },
  };
};
