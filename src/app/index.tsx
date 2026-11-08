import { AvailableBalance } from "@/screens/transfer/components/AvailableBalance";
import { Page } from "@/components/layout/Page";
import { RecipientSection } from "@/screens/transfer/components/RecipientSection";
import { TransferAmountField } from "@/screens/transfer/components/TransferAmountField";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useReviewTransfer } from "@/hooks/use-transfer";
import { accountOptions } from "@/query/banking";
import { selectTransferLocked, useTransferStore } from "@/stores/transfer";
import { useQuery } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { Keyboard } from "react-native";
import { useShallow } from "zustand/react/shallow";

export default function TransferScreen() {
  const account = useQuery(accountOptions);
  const { note, setDraft, noteError } = useTransferStore(
    useShallow((state) => ({
      note: state.draft.note,
      setDraft: state.setDraft,
      noteError: state.fieldErrors.note,
    })),
  );
  const locked = useTransferStore(selectTransferLocked);
  const review = useReviewTransfer();

  if (locked) return <Redirect href="/authenticate" />;

  return (
    <Page
      title="Make a transfer"
      subtitle="Choose a recipient and add a personal note."
    >
      <AvailableBalance />
      <RecipientSection />
      <TransferAmountField />
      <Field
        label="Note (optional)"
        value={note}
        onChangeText={(note) => setDraft((value) => ({ ...value, note }))}
        hint="Up to 200 characters."
        error={noteError}
        multiline
      />
      <Button
        label="Review transfer"
        disabled={!account.data}
        onPress={() => {
          Keyboard.dismiss();
          if (review()) router.navigate("/review");
        }}
      />
    </Page>
  );
}
