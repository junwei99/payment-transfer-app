import { ConfirmationBalanceStatus } from "@/screens/confirmation/components/ConfirmationBalanceStatus";
import { Page } from "@/components/layout/Page";
import { TransferLookupStatus } from "@/screens/confirmation/components/TransferLookupStatus";
import { TransferReceipt } from "@/screens/confirmation/components/TransferReceipt";
import { Button } from "@/components/ui/Button";
import { transferOptions } from "@/query/banking";
import { selectTransferLocked, useTransferStore } from "@/stores/transfer";
import { useQuery } from "@tanstack/react-query";
import { Redirect, router, useLocalSearchParams } from "expo-router";

const ConfirmationScreen = () => {
  const { id: param } = useLocalSearchParams<{ id?: string | string[] }>();

  const id = typeof param === "string" ? param : "";

  const transfer = useQuery(transferOptions(id));
  const reset = useTransferStore((state) => state.reset);
  const locked = useTransferStore(selectTransferLocked);

  if (locked) {
    return <Redirect href="/authenticate" />;
  }

  const completed = transfer.data;

  return (
    <Page
      title={completed ? "Transfer complete" : "Transfer details"}
      subtitle="Your transfer details, all in one place."
    >
      <TransferLookupStatus id={id} />
      <TransferReceipt id={id} />
      <ConfirmationBalanceStatus transferCompleted={!!completed} />

      <Button
        label="Done"
        onPress={() => {
          reset();
          router.dismissTo("/");
        }}
      />
    </Page>
  );
};

export default ConfirmationScreen;
