import { Field } from "@/components/ui/Field";
import { ACCOUNT_OPTIONS } from "@/query/banking";
import { useTransferStore } from "@/stores/transfer";
import { parseAmount } from "@/utils/transfer.utils";

import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native";
import { useShallow } from "zustand/react/shallow";

export const TransferAmountField = () => {
  const account = useQuery(ACCOUNT_OPTIONS);

  const { amount, error, setDraft } = useTransferStore(
    useShallow((state) => ({
      amount: state.draft.amount,
      error: state.fieldErrors.amount,
      setDraft: state.setDraft,
    })),
  );

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
};
