import { Text, TextInput, View, type TextInputProps } from "react-native";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export function Field({
  label,
  hint,
  error,
  ...props
}: TextInputProps & { label: string; hint?: string; error?: string }) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-secondary">{label}</Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        accessibilityHint={[hint, error].filter(Boolean).join(". ")}
        placeholderTextColor="#596779"
        className="min-h-12 border-b border-control pb-3 pt-2 text-lg text-ink focus:border-ink"
      />
      {hint ? <Text className="text-sm text-secondary">{hint}</Text> : null}
      {error ? <ErrorMessage message={error} /> : null}
    </View>
  );
}
