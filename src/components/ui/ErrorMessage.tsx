import { Text, View } from "react-native";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <View className="flex-row gap-3 rounded-lg bg-paper p-4">
      <View className="w-1 rounded-lg bg-error" />
      <Text
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        className="flex-1 text-base leading-6 text-ink"
      >
        {message}
      </Text>
    </View>
  );
}
