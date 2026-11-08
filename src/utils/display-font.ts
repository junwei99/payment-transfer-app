import { Platform } from "react-native";

export const DISPLAY_FONT = {
  fontFamily: Platform.select({
    ios: "Georgia",
    android: "serif",
    default: "Georgia, serif",
  }),
};
