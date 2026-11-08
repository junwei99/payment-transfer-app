import type { PropsWithChildren } from "react";
import { Text } from "react-native";
import { displayFont } from "@/utils/display-font";

export function SectionTitle({ children }: PropsWithChildren) {
  return (
    <Text
      accessibilityRole="header"
      style={displayFont}
      className="text-2xl text-ink"
    >
      {children}
    </Text>
  );
}
