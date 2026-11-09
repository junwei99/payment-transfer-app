import { Field } from "@/components/ui/Field";
import type { TGetApiEndpointSuccessResponse } from "@/schemas/api.schema";
import { RecipientChoice } from "@/screens/recipients/components/RecipientChoice";
import type { TRecipientDraftSelection } from "@/types/transfer.types";
import { useState } from "react";
import { FlatList, Text, View } from "react-native";

type TRecipientPickerResultsProps = {
  recipients: TGetApiEndpointSuccessResponse<"/recipients">;
  recipientSelection: TRecipientDraftSelection;
  onSelect: (selection: TRecipientDraftSelection) => void;
};

export const RecipientPickerResults = ({
  recipients,
  recipientSelection,
  onSelect,
}: TRecipientPickerResultsProps) => {
  const [search, setSearch] = useState("");

  const finalSearchQuery = search.trim().toLowerCase();

  const matchedRecipients = recipients.filter(
    ({ name, account }) =>
      name.toLowerCase().includes(finalSearchQuery) ||
      account.includes(finalSearchQuery),
  );

  return (
    <>
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
          selected={recipientSelection.kind === "MANUAL"}
          onPress={() => onSelect({ kind: "MANUAL" })}
        />

        {matchedRecipients.length === 0 ? (
          <Text className="py-4 text-sm text-secondary">
            {finalSearchQuery
              ? "No matching recipients."
              : "No saved recipients."}
          </Text>
        ) : null}
      </View>

      <FlatList
        style={{ flex: 1, marginTop: 16 }}
        data={matchedRecipients}
        keyExtractor={({ id }) => id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <RecipientChoice
            name={item.name}
            account={item.account}
            selected={
              recipientSelection.kind === "SAVED" &&
              recipientSelection.recipientId === item.id
            }
            onPress={() =>
              onSelect({
                kind: "SAVED",
                recipientId: item.id,
              })
            }
          />
        )}
      />
    </>
  );
};
