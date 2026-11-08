import { Text, View } from "react-native";
import { displayFont } from "@/utils/display-font";

export function Amount({
  currency,
  amount,
}: {
  currency: string;
  amount: string;
}) {
  return (
    <View className="flex-row flex-wrap items-baseline gap-x-3 gap-y-1">
      <Text className="text-sm text-secondary">{currency}</Text>
      <Text style={displayFont} className="text-4xl text-ink">
        {amount}
      </Text>
    </View>
  );
}
