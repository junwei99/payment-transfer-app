import { Platform } from "react-native";

export const displayFont = {
  fontFamily: Platform.select({
    ios: "Georgia",
    android: "serif",
    default: "Georgia, serif",
  }),
};
