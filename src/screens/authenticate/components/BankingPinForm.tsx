import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { BANKING_PIN_SCHEMA } from "@/schemas/banking-pin.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm } from "react-hook-form";

export const BankingPinForm = ({
  disabled,
  busy,
  onConfirm,
}: {
  disabled: boolean;
  busy: boolean;
  onConfirm: (pin: string) => void;
}) => {
  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(BANKING_PIN_SCHEMA),
    defaultValues: { pin: "" },
    mode: "onTouched",
  });

  const {
    field: { value, ref, onBlur },
    fieldState,
  } = useController({ control, name: "pin" });

  const confirmTransferBtnDisabled =
    disabled || !BANKING_PIN_SCHEMA.shape.pin.safeParse(value).success;

  return (
    <>
      <Field
        label="Banking PIN"
        hint="Enter your six-digit banking PIN, not your device passcode."
        secureTextEntry
        keyboardType="number-pad"
        autoComplete="off"
        value={value}
        ref={ref}
        onBlur={onBlur}
        onChangeText={(value) =>
          setValue("pin", value, { shouldTouch: true, shouldValidate: true })
        }
        editable={!disabled}
        error={fieldState.error?.message}
      />
      <Button
        label={busy ? "Approving transfer…" : "Confirm transfer"}
        busy={busy}
        disabled={confirmTransferBtnDisabled}
        onPress={() => {
          void handleSubmit(({ pin }) => {
            reset();
            onConfirm(pin);
          })();
        }}
      />
    </>
  );
};
