import { Details } from "@/components/transfer/Details";
import { Skeleton } from "@/components/ui/Skeleton";
import { transferOptions } from "@/query/banking";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";

export const TransferReceipt = ({ id }: { id: string }) => {
  const transfer = useQuery(transferOptions(id));
  const completed = transfer.data;

  if (!completed) {
    return id && transfer.isPending && transfer.fetchStatus !== "paused" ? (
      <Skeleton label="Loading transfer…" rows={4} />
    ) : null;
  }

  return (
    <>
      <Details details={completed} />

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
