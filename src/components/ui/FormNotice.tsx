import { Text, View } from "react-native";

export const FormNotice = ({
  message,
  variant,
}: {
  message: string;
  variant: "error" | "warning";
}) => {
  const isError = variant === "error";
  const title = isError ? "Error" : "Warning";

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${title}. ${message}`}
      className={`flex-row items-start gap-3 rounded-lg border p-4 ${
        isError
          ? "border-error-ink bg-error-surface"
          : "border-warning-ink bg-paper"
      }`}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className={`h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          isError
            ? "border-error-ink bg-error"
            : "border-warning-ink bg-surface"
        }`}
      >
        <Text
          className={`text-base leading-5 ${isError ? "text-error-ink" : "text-warning-ink"}`}
        >
          !
        </Text>
      </View>
      <View className="flex-1 gap-1">
        <Text
          className={`text-base leading-6 ${isError ? "text-error-ink" : "text-warning-ink"}`}
        >
          {title}
        </Text>
        <Text className="text-sm leading-5 text-ink">{message}</Text>
      </View>
    </View>
  );
};
