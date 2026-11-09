import { Skeleton } from "@/components/ui/Skeleton";
import type { TRecipientSelection } from "@/types/transfer.types";
import type { ComponentRef, Ref } from "react";
import { Pressable, Text, View } from "react-native";

type TRecipientSelectorProps = {
  ref?: Ref<ComponentRef<typeof View>>;
  selection: TRecipientSelection;
  loading: boolean;
  disabled: boolean;
  error?: string;
  onPress: () => void;
};

const describeSelection = (selection: TRecipientSelection): string => {
  if (selection.kind === "SAVED") {
    return `Recipient: ${selection.name}, account ${selection.account}`;
  }

  if (selection.kind === "MANUAL") {
    return "Recipient: enter manually";
  }

  return "Choose a recipient";
};

const titleSelection = (selection: TRecipientSelection): string => {
  if (selection.kind === "SAVED") {
    return selection.name;
  }

  if (selection.kind === "MANUAL") {
    return "Enter manually";
  }

  return "Choose a recipient";
};

export const RecipientSelector = ({
  ref,
  selection,
  loading,
  disabled,
  error,
  onPress,
}: TRecipientSelectorProps) => {
  if (loading) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel="Loading recipients"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
      >
        <Skeleton label="Loading recipients…" hideLabel />
      </Pressable>
    );
  }

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={describeSelection(selection)}
      accessibilityHint={
        error ??
        (disabled
          ? "Load recipients to open selection"
          : "Opens the recipient page")
      }
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.65 : 1,
      })}
      className={`min-h-12 flex-row items-center gap-4 border-b py-3 ${
        error ? "border-error-ink" : "border-control"
      }`}
    >
      <View className="flex-1 gap-1">
        <Text className="text-base text-ink">{titleSelection(selection)}</Text>
        {selection.kind === "SAVED" ? (
          <Text className="text-sm text-secondary">{selection.account}</Text>
        ) : null}
      </View>
      <Text accessible={false} className="text-xl text-ink">
        ›
      </Text>
    </Pressable>
  );
};
