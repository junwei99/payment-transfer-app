import type { ComponentRef, Ref } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export const Field = ({
  label,
  hint,
  error,
  ref,
  ...props
}: TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}) => {
  return (
    <View className="gap-2">
      <Text
        className={`text-sm ${error ? "text-error-ink" : "text-secondary"}`}
      >
        {label}
      </Text>
      <TextInput
        {...props}
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={[hint, error].filter(Boolean).join(". ")}
        placeholderTextColor="#596779"
        className={`min-h-12 border-b pb-3 pt-2 text-lg text-ink ${
          error
            ? "border-error-ink focus:border-error-ink"
            : "border-control focus:border-ink"
        }`}
      />
      {error ? <ErrorMessage message={error} /> : null}
      {hint ? <Text className="text-sm text-secondary">{hint}</Text> : null}
    </View>
  );
};
