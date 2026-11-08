import { Amount } from "@/components/transfer/Amount";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ACCOUNT_OPTIONS } from "@/query/banking";
import { formatMinor } from "@/utils/transfer.utils";

import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";

export const AvailableBalance = () => {
  const account = useQuery(ACCOUNT_OPTIONS);

  return (
    <View className="gap-3 rounded-xl bg-paper p-6">
      <Text className="text-sm text-secondary">Available balance</Text>
      {account.data ? (
        <Amount
          currency={account.data.currency}
          amount={formatMinor(account.data.balanceMinor)}
        />
      ) : (
        <Text>
          {account.fetchStatus === "paused"
            ? "Connect to load your balance."
            : account.isPending
              ? "Loading account…"
              : "Balance unavailable."}
        </Text>
      )}
      {account.isFetching && account.data ? (
        <Text>Refreshing balance…</Text>
      ) : null}
      {account.error ? (
        <ErrorMessage
          message={`${account.data ? "Balance refresh failed. Showing the last balance. " : ""}${account.error.message}`}
        />
      ) : null}
      {account.error || account.fetchStatus === "paused" ? (
        <Button
          label="Retry balance"
          secondary
          onPress={() => {
            void account.refetch();
          }}
        />
      ) : null}
    </View>
  );
};
