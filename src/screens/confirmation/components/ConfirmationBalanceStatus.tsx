import { Button } from "@/components/ui/Button";
import { accountOptions } from "@/query/banking";
import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native";

export function ConfirmationBalanceStatus({
  transferCompleted,
}: {
  transferCompleted: boolean;
}) {
  const account = useQuery(accountOptions);

  if (!transferCompleted || !account.error) return null;

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
}
