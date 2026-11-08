import { Field } from "@/components/ui/Field";
import { accountOptions } from "@/query/banking";
import { useTransferStore } from "@/stores/transfer";
import { parseAmount } from "@/utils/transfer.utils";
import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native";

export function TransferAmountField() {
  const account = useQuery(accountOptions);
  const amount = useTransferStore((state) => state.draft.amount);
  const error = useTransferStore((state) => state.fieldErrors.amount);
  const setDraft = useTransferStore((state) => state.setDraft);
  const amountMinor = parseAmount(amount);

  return (
    <>
      <Field
        label={`Amount${account.data ? ` (${account.data.currency})` : ""}`}
        value={amount}
        onChangeText={(amount) => setDraft((value) => ({ ...value, amount }))}
        keyboardType="decimal-pad"
        error={error}
      />
      {account.data &&
      amountMinor !== null &&
      amountMinor > account.data.balanceMinor ? (
        <Text className="text-base text-secondary">
          This amount exceeds the last available balance. The service will check
          your balance when you submit.
        </Text>
      ) : null}
    </>
  );
}
