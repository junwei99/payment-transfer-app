import { Page } from "@/components/layout/Page";
import { useOnline } from "@/hooks/useOnline";
import { ACCOUNT_OPTIONS, RECIPIENTS_OPTIONS } from "@/query/banking";
import { AvailableBalance } from "@/screens/transfer/components/AvailableBalance";
import { TransferForm } from "@/screens/transfer/components/TransferForm";
import { selectTransferLocked, useTransferStore } from "@/stores/transfer";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { useRef, useState } from "react";

const TransferScreen = () => {
  const account = useQuery(ACCOUNT_OPTIONS);
  const recipients = useQuery(RECIPIENTS_OPTIONS);

  const isOnline = useOnline();

  const [refreshing, setRefreshing] = useState(false);
  // TOOD ASK AI: why is refreshInProgress required here?
  const refreshInProgress = useRef(false);

  const locked = useTransferStore(selectTransferLocked);

  const refresh = async () => {
    if (refreshInProgress.current) {
      return;
    }

    if (!isOnline) {
      return;
    }

    refreshInProgress.current = true;
    setRefreshing(true);

    try {
      await Promise.allSettled([account.refetch(), recipients.refetch()]);
    } finally {
      refreshInProgress.current = false;
      setRefreshing(false);
    }
  };

  if (locked) {
    return <Redirect href="/authenticate" />;
  }

  return (
    <Page
      title="Make a transfer"
      subtitle="Choose a recipient and add a personal note."
      refreshing={refreshing && isOnline}
      onRefresh={() => {
        void refresh();
      }}
    >
      <AvailableBalance />
      <TransferForm />
    </Page>
  );
};

export default TransferScreen;
