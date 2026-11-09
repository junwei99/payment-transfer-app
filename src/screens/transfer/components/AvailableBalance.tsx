import { Amount } from "@/components/transfer/Amount";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusNotice } from "@/components/ui/StatusNotice";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { ACCOUNT_OPTIONS } from "@/query/banking";
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

  const { isOnline, connectionUnavailable } = useConnectionStatus(
    fetchStatus,
    error,
  );

  const errState = (() => {
    if (isFetching) {
      return {
        state: "NO_ERROR",
      } as const;
    }

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
        errTitle: accountResponse
          ? "Balance may be out of date"
          : "Can't load your balance",
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
        ) : errState.state === "INITIAL_LOAD_NETWORK_ERROR" ||
          errState.state === "ERROR" ? (
          <StatusNotice
            variant={errState.state === "ERROR" ? "error" : "connection-error"}
            title={errState.errTitle}
            message={errState.errMsg}
          />
        ) : (
          <Text className="text-base text-ink">Balance unavailable.</Text>
        )}
      </View>

      {errState.state === "NETWORK_ERROR_WITH_KNOWN_RESPONSE" ? (
        <StatusNotice title={errState.errTitle} message={errState.errMsg} />
      ) : null}

      {errState.state === "ERROR" && accountResponse ? (
        <StatusNotice
          variant="error"
          title={errState.errTitle}
          message={errState.errMsg}
        />
      ) : null}
    </View>
  );
};
