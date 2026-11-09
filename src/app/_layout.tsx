import "@/global.css";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TransferFormProvider } from "@/components/transfer/TransferFormProvider";
import { QueryProvider } from "@/query/QueryProvider";

const RootLayout = () => {
  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      <QueryProvider>
        <TransferFormProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none",
              contentStyle: { backgroundColor: "#fafaf8" },
            }}
          />
        </TransferFormProvider>
      </QueryProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
