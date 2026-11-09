import "@/global.css";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryProvider } from "@/query/QueryProvider";

const RootLayout = () => {
  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      <QueryProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
            contentStyle: { backgroundColor: "#fafaf8" },
          }}
        />
      </QueryProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
