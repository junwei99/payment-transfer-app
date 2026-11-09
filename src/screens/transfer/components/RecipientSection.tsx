import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Field } from "@/components/ui/Field";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Skeleton } from "@/components/ui/Skeleton";
import { RECIPIENTS_OPTIONS } from "@/query/banking";
import { useTransferStore } from "@/stores/transfer";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useShallow } from "zustand/react/shallow";

export const RecipientSection = () => {
  const recipients = useQuery(RECIPIENTS_OPTIONS);

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

  const selected = recipients.data?.find(({ id }) => id === recipientId);

  const missing = !manual && !!recipientId && !!recipients.data && !selected;

  return (
    <View className="gap-4">
      <SectionTitle>Recipient</SectionTitle>

      {!manual && recipients.isFetching ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Loading recipients. Open recipient selection"
          onPress={() => router.push("/recipients")}
        >
          <Skeleton label="Loading recipients…" hideLabel />
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            selected
              ? `Recipient: ${selected.name}, account ${selected.account}`
              : manual
                ? "Recipient: enter manually"
                : "Choose a recipient"
          }
          accessibilityHint="Opens the recipient page"
          onPress={() => router.push("/recipients")}
          className="min-h-12 flex-row items-center gap-4 border-b border-control py-3"
        >
          <View className="flex-1 gap-1">
            <Text className="text-base text-ink">
              {manual
                ? "Enter manually"
                : selected
                  ? selected.name
                  : "Choose a recipient"}
            </Text>
            {selected ? (
              <Text className="text-sm text-secondary">{selected.account}</Text>
            ) : null}
          </View>
          <Text accessible={false} className="text-xl text-ink">
            ›
          </Text>
        </Pressable>
      )}

      {!manual ? (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            setDraft((draft) => ({
              ...draft,
              manual: true,
              recipientId: null,
            }))
          }
          className="min-h-12 self-start justify-center"
        >
          <Text className="text-base text-ink">Enter account manually</Text>
        </Pressable>
      ) : null}

      {recipients.fetchStatus === "paused" && !recipients.data ? (
        <Text className="text-sm text-secondary">
          Connect to load recipients, or enter one manually.
        </Text>
      ) : null}
      {missing ? (
        <ErrorMessage message="Recipient no longer available. Choose another recipient." />
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
};
