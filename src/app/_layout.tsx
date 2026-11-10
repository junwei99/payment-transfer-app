import "@/global.css";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TransferFormProvider } from "@/components/transfer/TransferFormProvider";
import { QueryProvider } from "@/query/QueryProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const RootLayout = () => {
  const reducedMotion = useReducedMotion();

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
          >
            <Stack.Screen
              name="recipients"
              options={{ animation: reducedMotion ? "none" : "default" }}
            />
            <Stack.Screen
              name="review"
              options={{ animation: reducedMotion ? "none" : "default" }}
            />
            <Stack.Screen
              name="authenticate"
              options={{ animation: reducedMotion ? "none" : "default" }}
            />
            <Stack.Screen
              name="confirmation"
              options={{ animation: reducedMotion ? "none" : "default" }}
            />
          </Stack>
        </TransferFormProvider>
      </QueryProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
