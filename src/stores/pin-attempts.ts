import { create } from "zustand";

type TPinAttempts = {
  blockedUntil: number;
  reset: () => void;
  blockUntil: (timestamp: number) => void;
};

// Only mirrors the server cooldown for display; the server enforces attempts.
export const usePinAttempts = create<TPinAttempts>((set) => ({
  blockedUntil: 0,
  reset: () => set({ blockedUntil: 0 }),
  blockUntil: (timestamp) => set({ blockedUntil: timestamp }),
}));
