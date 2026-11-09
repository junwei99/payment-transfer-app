import { Text, View } from "react-native";

export const Skeleton = ({
  label,
  rows = 1,
  amount = false,
  hideLabel = false,
}: {
  label: string;
  rows?: number;
  amount?: boolean;
  hideLabel?: boolean;
}) => (
  <View
    accessibilityRole="progressbar"
    accessibilityLabel={label}
    className="gap-3"
  >
    {amount ? (
      <View accessible={false} className="h-12 flex-row items-center gap-3">
        <View className="h-4 w-8 rounded bg-sage" />
        <View className="h-9 w-40 rounded-lg bg-sage" />
      </View>
    ) : (
      Array.from({ length: rows }, (_, index) => (
        <View
          key={index}
          accessible={false}
          className="h-12 rounded-lg bg-sage"
        />
      ))
    )}
    {hideLabel ? null : (
      <Text accessibilityLiveRegion="polite" className="text-sm text-secondary">
        {label}
      </Text>
    )}
  </View>
);
