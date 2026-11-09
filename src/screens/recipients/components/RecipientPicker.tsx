import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Field } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { RECIPIENTS_OPTIONS } from "@/query/banking";
import { RecipientChoice } from "@/screens/transfer/components/RecipientChoice";
import { selectTransferLocked, useTransferStore } from "@/stores/transfer";
import { DISPLAY_FONT } from "@/utils/display-font";
import { useQuery } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

export const RecipientPicker = () => {
  const recipients = useQuery(RECIPIENTS_OPTIONS);
  const [search, setSearch] = useState("");
  const locked = useTransferStore(selectTransferLocked);
  const { manual, recipientId, setDraft } = useTransferStore(
    useShallow((state) => ({
      manual: state.draft.manual,
      recipientId: state.draft.recipientId,
      setDraft: state.setDraft,
    })),
  );

  const term = search.trim().toLowerCase();
  const matches =
    recipients.data?.filter(
      ({ name, account }) =>
        name.toLowerCase().includes(term) || account.includes(term),
    ) ?? [];

  const goBack = () => router.dismissTo("/");

  if (locked) {
    return <Redirect href="/authenticate" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf8" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={{ flex: 1 }}
          className="mx-auto w-full max-w-xl px-6 pb-6 pt-4"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to transfer"
            onPress={goBack}
            className="min-h-12 self-start justify-center"
          >
            <Text className="text-base text-ink">‹ Back</Text>
          </Pressable>

          <Text
            accessibilityRole="header"
            style={DISPLAY_FONT}
            className="mb-6 mt-4 text-4xl text-ink"
          >
            Choose a recipient
          </Text>

          <Field
            label="Search recipients"
            value={search}
            onChangeText={setSearch}
            placeholder="Name or account number"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />

          <View className="mt-6 gap-4">
            <RecipientChoice
              name="Enter manually"
              selected={manual}
              onPress={() => {
                setDraft((draft) => ({
                  ...draft,
                  manual: true,
                  recipientId: null,
                }));
                goBack();
              }}
            />
            {recipients.isFetching && recipients.data ? (
              <Text className="text-sm text-secondary">
                Refreshing recipients…
              </Text>
            ) : null}
            {recipients.isPending && recipients.fetchStatus !== "paused" ? (
              <Skeleton label="Loading recipients…" rows={3} />
            ) : null}
            {recipients.fetchStatus === "paused" && !recipients.data ? (
              <Text className="text-sm text-secondary">
                Connect to load recipients, or enter one manually.
              </Text>
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
            {recipients.data && matches.length === 0 ? (
              <Text className="py-4 text-sm text-secondary">
                {term ? "No matching recipients." : "No saved recipients."}
              </Text>
            ) : null}
          </View>

          <FlatList
            style={{ flex: 1, marginTop: 16 }}
            data={matches}
            keyExtractor={({ id }) => id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <RecipientChoice
                name={item.name}
                account={item.account}
                selected={!manual && recipientId === item.id}
                onPress={() => {
                  setDraft((draft) => ({
                    ...draft,
                    manual: false,
                    recipientId: item.id,
                  }));
                  goBack();
                }}
              />
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
