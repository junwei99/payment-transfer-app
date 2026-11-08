import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import * as Network from "expo-network";
import { useEffect, useState, type PropsWithChildren } from "react";
import { AppState, Platform } from "react-native";

export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient());
  useEffect(() => {
    if (Platform.OS === "web") return;
    let active = true;
    let networkEventReceived = false;
    const update = (state: Network.NetworkState) => {
      onlineManager.setOnline(
        state.isConnected !== false && state.isInternetReachable !== false,
      );
    };
    const network = Network.addNetworkStateListener((state) => {
      networkEventReceived = true;
      update(state);
    });
    void Network.getNetworkStateAsync()
      .then((state) => {
        if (active && !networkEventReceived) update(state);
      })
      .catch(() => {
        /* Requests still surface connectivity failures. */
      });
    focusManager.setFocused(AppState.currentState === "active");
    const appState = AppState.addEventListener("change", (state) => {
      focusManager.setFocused(state === "active");
    });
    return () => {
      active = false;
      network.remove();
      appState.remove();
      focusManager.setFocused(undefined);
    };
  }, []);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
