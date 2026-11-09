import { ActivityIndicator, Pressable, Text, View } from "react-native";

export const Button = ({
  label,
  onPress,
  secondary = false,
  disabled = false,
  busy = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  busy?: boolean;
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      className={
        secondary
          ? "min-h-12 justify-center rounded-lg border border-control px-5 py-4"
          : "min-h-12 justify-center rounded-lg bg-accent px-5 py-4"
      }
      style={({ pressed }) => ({
        opacity: busy ? 1 : disabled ? 0.5 : pressed ? 0.65 : 1,
      })}
    >
      <View className="flex-row items-center justify-center gap-3">
        {busy ? <ActivityIndicator size="small" color="#4a5568" /> : null}
        <Text className="text-center text-base text-ink">{label}</Text>
      </View>
    </Pressable>
  );
};
