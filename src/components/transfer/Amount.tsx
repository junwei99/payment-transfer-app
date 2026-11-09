import { Text, View } from "react-native";
import { DISPLAY_FONT } from "@/utils/display-font";

export const Amount = ({
  currency,
  amount,
}: {
  currency: string;
  amount: string;
}) => {
  return (
    <View className="flex-row flex-wrap items-baseline gap-x-3 gap-y-1">
      <Text className="text-sm text-secondary">{currency}</Text>
      <Text style={DISPLAY_FONT} className="text-4xl text-ink">
        {amount}
      </Text>
    </View>
  );
};
