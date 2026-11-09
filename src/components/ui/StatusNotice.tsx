import { Text, View } from "react-native";

const ICON_COLOR = "#596779";
const ICON_BACKGROUND = "#e4e8dc";

const ConnectionIcon = () => {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: 48,
        height: 48,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 24,
        backgroundColor: ICON_BACKGROUND,
      }}
    >
      <View
        style={{
          height: 24,
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 3,
        }}
      >
        <View
          style={{
            width: 5,
            height: 8,
            borderRadius: 2,
            backgroundColor: ICON_COLOR,
          }}
        />
        <View
          style={{
            width: 5,
            height: 15,
            borderRadius: 2,
            backgroundColor: ICON_COLOR,
          }}
        />
        <View
          style={{
            width: 5,
            height: 22,
            borderRadius: 2,
            backgroundColor: ICON_COLOR,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          width: 34,
          height: 5,
          borderRadius: 3,
          backgroundColor: ICON_BACKGROUND,
          transform: [{ rotate: "-45deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 34,
          height: 2,
          borderRadius: 1,
          backgroundColor: ICON_COLOR,
          transform: [{ rotate: "-45deg" }],
        }}
      />
    </View>
  );
};

export const StatusNotice = ({
  title,
  message,
  variant = "connection-error",
}: {
  title: string;
  message: string;
  variant?: "connection-error" | "error";
}) => {
  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${title}. ${message}`}
      className="flex-row items-start gap-3"
    >
      {variant === "connection-error" ? (
        <ConnectionIcon />
      ) : (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error"
        >
          <Text className="text-2xl text-ink">!</Text>
        </View>
      )}
      <View className="flex-1 gap-1">
        <Text className="text-base text-ink">{title}</Text>
        <Text className="text-sm leading-5 text-secondary">{message}</Text>
      </View>
    </View>
  );
};
