import type { PropsWithChildren } from "react";
import { Text } from "react-native";
import { DISPLAY_FONT } from "@/utils/display-font";

export const SectionTitle = ({ children }: PropsWithChildren) => {
  return (
    <Text
      accessibilityRole="header"
      style={DISPLAY_FONT}
      className="text-2xl text-ink"
    >
      {children}
    </Text>
  );
};
