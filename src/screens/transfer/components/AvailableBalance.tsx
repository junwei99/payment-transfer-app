import { Amount } from "@/components/transfer/Amount";
import { ConnectionNotice } from "@/components/ui/ConnectionNotice";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOnline } from "@/hooks/useOnline";
import { ACCOUNT_OPTIONS, isConnectionError } from "@/query/banking";
import { formatMinor } from "@/utils/transfer.utils";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";

export const AvailableBalance = () => {
  const {
    data: accountResponse,
    fetchStatus,
    isFetching,
    error,
  } = useQuery(ACCOUNT_OPTIONS);

  const isOnline = useOnline();

  const errorState = (() => {
    if (isFetching) {
      return {
        state: "NO_ERROR",
      } as const;
    }

    const connectionUnavailable =
      !isOnline || fetchStatus === "paused" || isConnectionError(error);

    const networkErrorWithLastKnownResponse =
      accountResponse && connectionUnavailable;

    if (networkErrorWithLastKnownResponse) {
      return {
        state: "NETWORK_ERROR_WITH_KNOWN_RESPONSE",
        errTitle: "Balance may be out of date",
        errMsg: isOnline
          ? "We couldn't refresh it. Showing your last known balance. Pull down to refresh."
          : "You're offline. Showing your last known balance. Pull down to refresh when connected.",
      } as const;
    }

    if (connectionUnavailable) {
      return {
        state: "INITIAL_LOAD_NETWORK_ERROR",
        errTitle: "Can't load your balance",
        errMsg: "We couldn't connect. Pull down to refresh.",
      } as const;
    }

    if (error) {
      return {
        state: "ERROR",
        errMsg: accountResponse
          ? "Balance refresh failed. Showing the last known balance. Pull down to refresh."
          : "Failed to retrieve balance. Pull down to refresh.",
      } as const;
    }

    return {
      state: "NO_ERROR",
    } as const;
  })();

  return (
    <View className="gap-3 rounded-xl bg-paper p-6">
      <Text className="text-sm text-secondary">Available balance</Text>
      <View className="min-h-12 justify-center">
        {isFetching ? (
          <Skeleton label="Loading balance…" amount hideLabel />
        ) : accountResponse ? (
          <Amount
            currency={accountResponse.currency}
            amount={formatMinor(accountResponse.balanceMinor)}
          />
        ) : errorState.state === "INITIAL_LOAD_NETWORK_ERROR" ? (
          <ConnectionNotice
            title={errorState.errTitle}
            message={errorState.errMsg}
          />
        ) : (
          <Text className="text-base text-ink">Balance unavailable.</Text>
        )}
      </View>

      {errorState.state === "NETWORK_ERROR_WITH_KNOWN_RESPONSE" ? (
        <ConnectionNotice
          title={errorState.errTitle}
          message={errorState.errMsg}
        />
      ) : null}

      {errorState.state === "ERROR" ? (
        <ErrorMessage message={errorState.errMsg} />
      ) : null}
    </View>
  );
};
