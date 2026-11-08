import { Pressable, Text, View } from "react-native";

export function RecipientChoice({
  name,
  account,
  selected,
  onPress,
}: {
  name: string;
  account?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={account ? `${name}, account ${account}` : name}
      onPress={onPress}
      className={
        selected
          ? "min-h-12 flex-row items-center gap-4 rounded-lg bg-sage px-4 py-4"
          : "min-h-12 flex-row items-center gap-4 border-b border-divider px-4 py-4"
      }
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      <View className="flex-1 gap-1">
        <Text className="text-base text-ink">{name}</Text>
        {account ? (
          <Text className="text-sm text-secondary">{account}</Text>
        ) : null}
      </View>
      <View
        accessible={false}
        className="h-5 w-5 items-center justify-center rounded-full border border-control"
      >
        {selected ? <View className="h-2 w-2 rounded-full bg-ink" /> : null}
      </View>
    </Pressable>
  );
}
