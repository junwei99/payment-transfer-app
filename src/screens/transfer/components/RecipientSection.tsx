import { RecipientLoadStatus } from "@/components/transfer/RecipientLoadStatus";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useTransferFormActions } from "@/hooks/useTransferFormActions";
import { RECIPIENTS_OPTIONS } from "@/query/banking";
import type {
  TTransferFormOutput,
  TTransferFormValues,
} from "@/schemas/transfer-form.schema";
import { ManualRecipientFields } from "@/screens/transfer/components/ManualRecipientFields";
import { RecipientSelector } from "@/screens/transfer/components/RecipientSelector";
import { getRecipientDraftSelection } from "@/utils/transfer-form.utils";
import { selectRecipientSelection } from "@/utils/transfer.utils";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useController, useWatch } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

export const RecipientSection = () => {
  const { selectRecipient } = useTransferFormActions();

  const recipients = useQuery(RECIPIENTS_OPTIONS);

  const { field, fieldState, formState } = useController<
    TTransferFormValues,
    "recipient",
    TTransferFormOutput
  >({ name: "recipient" });

  const recipientId = useWatch<TTransferFormValues, "recipientId">({
    name: "recipientId",
  });

  const recipientSelection = getRecipientDraftSelection({
    recipient: field.value,
    recipientId,
  });

  const error =
    fieldState.isTouched || formState.isSubmitted
      ? fieldState.error?.message
      : undefined;

  const isManualInputRecipient = recipientSelection.kind === "MANUAL";

  const recipientsIsLoading = !isManualInputRecipient && recipients.isFetching;

  const selection = selectRecipientSelection(
    recipientSelection,
    recipients.data,
  );

  return (
    <View className="gap-4">
      <SectionTitle>Recipient</SectionTitle>

      <RecipientSelector
        ref={recipients.data ? field.ref : undefined}
        selection={selection}
        loading={recipientsIsLoading}
        disabled={!recipients.data}
        error={error}
        onPress={() => {
          if (recipients.data) {
            router.push("/recipients");
          }
        }}
      />

      {!isManualInputRecipient ? (
        <Pressable
          ref={!recipients.data ? field.ref : undefined}
          accessibilityRole="button"
          onPress={() => selectRecipient({ kind: "MANUAL" })}
          className="min-h-12 self-start justify-center"
        >
          <Text className="text-base text-ink">Enter account manually</Text>
        </Pressable>
      ) : null}

      {selection.kind === "MISSING" && !error ? (
        <ErrorMessage message="Recipient no longer available. Choose another recipient." />
      ) : null}

      <RecipientLoadStatus />

      {isManualInputRecipient ? <ManualRecipientFields /> : null}

      {error ? <ErrorMessage message={error} /> : null}
    </View>
  );
};
