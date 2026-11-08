import { Details } from "@/components/transfer/Details";
import { transferOptions } from "@/query/banking";
import { displayDetails } from "@/utils/transfer.utils";

import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";

export const TransferReceipt = ({ id }: { id: string }) => {
  const transfer = useQuery(transferOptions(id));
  const completed = transfer.data;

  if (!completed) {
    return null;
  }

  return (
    <>
      <View className="flex-row items-center gap-3 rounded-lg bg-sage p-4">
        <Text
          accessibilityLiveRegion="polite"
          className="flex-1 text-base leading-6 text-ink"
        >
          Transfer completed on the simulated backend. No real money moved.
        </Text>
      </View>

      <Details details={displayDetails(completed)} />

      <View className="gap-2 border-t border-divider pt-5">
        <Text selectable className="text-base text-ink">
          Reference: {completed.reference}
        </Text>
        <Text className="text-base text-ink">
          {new Date(completed.createdAt).toLocaleString()}
        </Text>
      </View>
    </>
  );
};
