import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { transferOptions } from "@/query/banking";
import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native";

export const TransferLookupStatus = ({ id }: { id: string }) => {
  const transfer = useQuery(transferOptions(id));

  return (
    <>
      {!id.trim() ? (
        <ErrorMessage message="No transfer ID was provided." />
      ) : null}
      {id && transfer.isPending && transfer.fetchStatus === "paused" ? (
        <Text>Connect to load this transfer.</Text>
      ) : null}
      {transfer.error ? (
        <ErrorMessage message={transfer.error.message} />
      ) : null}
      {transfer.error || transfer.fetchStatus === "paused" ? (
        <Button
          label="Retry transfer lookup"
          secondary
          onPress={() => {
            void transfer.refetch();
          }}
        />
      ) : null}
    </>
  );
};
