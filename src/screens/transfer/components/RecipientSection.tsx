import { RecipientChoice } from "@/screens/transfer/components/RecipientChoice";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Field } from "@/components/ui/Field";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { recipientsOptions } from "@/query/banking";
import { useTransferStore } from "@/stores/transfer";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { useShallow } from "zustand/react/shallow";

export function RecipientSection() {
  const recipients = useQuery(recipientsOptions);
  const { manual, recipientId, name, account, error, setDraft } =
    useTransferStore(
      useShallow((state) => ({
        manual: state.draft.manual,
        recipientId: state.draft.recipientId,
        name: state.draft.name,
        account: state.draft.account,
        error: state.fieldErrors.recipient,
        setDraft: state.setDraft,
      })),
    );

  return (
    <View className="gap-4">
      <SectionTitle>Recipient</SectionTitle>
      {recipients.isPending ? (
        <Text>
          {recipients.fetchStatus === "paused"
            ? "Connect to load recipients, or enter one manually."
            : "Loading recipients…"}
        </Text>
      ) : null}
      {recipients.data?.length === 0 ? (
        <Text>No saved recipients. Enter the recipient manually.</Text>
      ) : null}
      {recipients.error ? (
        <ErrorMessage
          message={`${recipients.data ? "Recipient refresh failed. " : ""}${recipients.error.message} You can enter a recipient manually.`}
        />
      ) : null}
      {recipients.error || recipients.fetchStatus === "paused" ? (
        <Button
          label="Retry recipients"
          secondary
          onPress={() => {
            void recipients.refetch();
          }}
        />
      ) : null}
      {recipients.data?.map((recipient) => (
        <RecipientChoice
          key={recipient.id}
          name={recipient.name}
          account={recipient.account}
          selected={!manual && recipientId === recipient.id}
          onPress={() =>
            setDraft((value) => ({
              ...value,
              manual: false,
              recipientId: recipient.id,
            }))
          }
        />
      ))}
      <RecipientChoice
        name="Enter manually"
        selected={manual}
        onPress={() =>
          setDraft((value) => ({ ...value, manual: true, recipientId: null }))
        }
      />
      {manual ? (
        <View className="gap-6">
          <Field
            label="Recipient name"
            value={name}
            onChangeText={(name) => setDraft((value) => ({ ...value, name }))}
            autoCapitalize="words"
          />
          <Field
            label="Account number"
            value={account}
            onChangeText={(account) =>
              setDraft((value) => ({ ...value, account }))
            }
            hint="Exactly ten digits, including any leading zeros."
            keyboardType="number-pad"
          />
        </View>
      ) : null}
      {error ? <ErrorMessage message={error} /> : null}
    </View>
  );
}
