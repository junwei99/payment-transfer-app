import { Button } from "@/components/ui/Button";
import { ACCOUNT_OPTIONS } from "@/query/banking";
import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native";

export const ConfirmationBalanceStatus = ({
  transferCompleted,
}: {
  transferCompleted: boolean;
}) => {
  const account = useQuery(ACCOUNT_OPTIONS);

  if (!transferCompleted || !account.error) {
    return null;
  }

  return (
    <>
      <Text>Your transfer succeeded. The latest balance is unavailable.</Text>
      <Button
        label="Retry balance refresh"
        secondary
        onPress={() => {
          void account.refetch();
        }}
      />
    </>
  );
};
