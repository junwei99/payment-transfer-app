import { Pressable, Text } from "react-native";

export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={
        secondary
          ? "min-h-12 justify-center rounded-lg border border-control px-5 py-4"
          : "min-h-12 justify-center rounded-lg bg-accent px-5 py-4"
      }
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.65 : 1,
      })}
    >
      <Text className="text-center text-base text-ink">{label}</Text>
    </Pressable>
  );
}
