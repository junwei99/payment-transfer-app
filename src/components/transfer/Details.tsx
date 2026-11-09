import { Text, View } from "react-native";
import type { TReviewedTransfer } from "@/types/transfer.types";
import { Amount } from "@/components/transfer/Amount";
import { displayDetails } from "@/utils/transfer.utils";

export const Details = ({
  details: transfer,
}: {
  details: TReviewedTransfer;
}) => {
  const details = displayDetails(transfer);

  return (
    <View className="gap-6 rounded-xl border border-divider bg-surface p-6">
      <View className="gap-3 border-b border-divider pb-6">
        <Text className="text-sm text-secondary">Transfer amount</Text>
        <Amount currency={details.currency} amount={details.amount} />
      </View>

      <View className="gap-2">
        <Text className="text-sm text-secondary">To</Text>
        <Text selectable className="text-xl text-ink">
          {details.name}
        </Text>
        <Text selectable className="text-base text-ink">
          {details.account}
        </Text>
      </View>

      {details.note ? (
        <View className="gap-2">
          <Text className="text-sm text-secondary">Note</Text>
          <Text selectable className="text-base text-ink">
            {details.note}
          </Text>
        </View>
      ) : null}
    </View>
  );
};
