import { onlineManager } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

const getIsOnline = () => onlineManager.isOnline();

export const useOnline = () =>
  useSyncExternalStore(onlineManager.subscribe, getIsOnline, getIsOnline);
