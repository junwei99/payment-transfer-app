import { Field } from "@/components/ui/Field";
import { FormNotice } from "@/components/ui/FormNotice";
import { useTransferField } from "@/hooks/useTransferField";
import { ACCOUNT_OPTIONS } from "@/query/banking";
import { parseAmount } from "@/utils/transfer.utils";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";

export const TransferAmountField = () => {
  const amount = useTransferField("amount");
  const account = useQuery(ACCOUNT_OPTIONS);
  const amountMinor = parseAmount(amount.value);

  const showInputAmountExceedBalanceWarning =
    account.data &&
    amountMinor !== null &&
    amountMinor > account.data.balanceMinor;

  return (
    <View className="gap-3">
      <Field
        {...amount}
        label={`Amount${account.data ? ` (${account.data.currency})` : ""}`}
        keyboardType="decimal-pad"
        hint="Up to 20 characters; at most two decimal places."
      />
      {showInputAmountExceedBalanceWarning ? (
        <FormNotice
          variant="warning"
          message="This amount exceeds the last available balance. You can still review this transfer. The service will check your balance when you submit."
        />
      ) : null}
    </View>
  );
};
