import { usePinAttempts } from "@/stores/pin-attempts";
import { useEffect, useState } from "react";

export const usePinCooldown = () => {
  const blockedUntil = usePinAttempts((state) => state.blockedUntil);
  const [now, setNow] = useState(Date.now);
  const remaining = Math.max(0, Math.ceil((blockedUntil - now) / 1000));

  const blockUntil = (timestamp: number) => {
    usePinAttempts.getState().blockUntil(timestamp);
    setNow(Date.now());
  };

  useEffect(() => {
    if (!blockedUntil) {
      return;
    }

    const tick = () => {
      const time = Date.now();

      setNow(time);

      if (usePinAttempts.getState().blockedUntil <= time) {
        usePinAttempts.getState().reset();
      }
    };

    const timer = setInterval(tick, 250);

    return () => clearInterval(timer);
  }, [blockedUntil]);

  return { remaining, blockUntil };
};
