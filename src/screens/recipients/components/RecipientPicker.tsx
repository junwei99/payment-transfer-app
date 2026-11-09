import { Button } from "@/components/ui/Button";
import { useTransferFormActions } from "@/hooks/useTransferFormActions";
import { RECIPIENTS_OPTIONS } from "@/query/banking";
import type { TTransferFormValues } from "@/schemas/transfer-form.schema";
import { RecipientPickerResults } from "@/screens/recipients/components/RecipientPickerResults";
import { selectTransferLocked, useTransferStore } from "@/stores/transfer";
import type { TRecipientDraftSelection } from "@/types/transfer.types";
import { DISPLAY_FONT } from "@/utils/display-font";
import { getRecipientDraftSelection } from "@/utils/transfer-form.utils";
import { useQuery } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useWatch } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const RecipientPicker = () => {
  const { selectRecipient: updateRecipient } = useTransferFormActions();

  const recipients = useQuery({ ...RECIPIENTS_OPTIONS, enabled: false });

  const locked = useTransferStore(selectTransferLocked);

  const [recipient, recipientId] = useWatch<
    TTransferFormValues,
    ["recipient", "recipientId"]
  >({ name: ["recipient", "recipientId"] });

  const recipientSelection = getRecipientDraftSelection({
    recipient,
    recipientId,
  });

  const goBack = () => router.dismissTo("/");

  const selectRecipient = (selection: TRecipientDraftSelection) => {
    updateRecipient(selection);
    goBack();
  };

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

          {!recipients.data ? (
            <View className="gap-4">
              <Text className="text-base text-ink">
                Recipients unavailable. Return to the transfer form to refresh
                or enter one manually.
              </Text>
              <Button label="Back to transfer" onPress={goBack} secondary />
            </View>
          ) : (
            <RecipientPickerResults
              recipients={recipients.data}
              recipientSelection={recipientSelection}
              onSelect={selectRecipient}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
