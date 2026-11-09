import { Field } from "@/components/ui/Field";
import { useTransferField } from "@/hooks/useTransferField";
import { View } from "react-native";

export const ManualRecipientFields = () => {
  const name = useTransferField("name");
  const account = useTransferField("account");

  return (
    <View className="gap-6">
      <Field
        {...name}
        label="Recipient name"
        hint="Up to 100 characters."
        autoCapitalize="words"
      />
      <Field
        {...account}
        label="Account number"
        hint="Exactly ten digits, including any leading zeros."
        keyboardType="number-pad"
      />
    </View>
  );
};
