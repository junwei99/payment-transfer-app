import { useAuthenticationAttempt } from "@/hooks/useAuthenticationAttempt";
import { usePinCooldown } from "@/hooks/usePinCooldown";
import { useSubmitTransfer } from "@/hooks/useSubmitTransfer";
import { authentication } from "@/services/authentication";
import { usePinAttempts } from "@/stores/pin-attempts";
import { useTransferStore } from "@/stores/transfer";
import { useCallback, useEffect, useState } from "react";

export const useAuthenticationChallenge = ({
  attemptId,
  method,
}: {
  attemptId: string;
  method: "biometric" | "pin";
}) => {
  const transfer = useSubmitTransfer();
  const approving = useTransferStore(
    (state) => state.journey.status === "APPROVING",
  );

  const [mode, setMode] = useState(method);
  const [message, setMessage] = useState<string | null>(null);

  const { remaining, blockUntil } = usePinCooldown();

  const { isAuthenticating, runAuthentication, cancelAttempt } =
    useAuthenticationAttempt(attemptId, method === "biometric");

  const biometrics = useCallback(
    () =>
      runAuthentication(
        async (isAuthenticationRunCurrent) => {
          setMode("biometric");
          setMessage(null);

          const available = await authentication.canUseBiometrics();

          if (!isAuthenticationRunCurrent()) {
            return;
          }

          if (!available) {
            setMode("pin");
            setMessage("Biometrics are unavailable. Use your banking PIN.");
            return;
          }

          const outcome = await authentication.authenticate();

          if (!isAuthenticationRunCurrent()) {
            return;
          }

          switch (outcome) {
            case "SUCCESS":
              void transfer(attemptId, { method: "biometric", success: true });
              break;
            case "CANCELLED":
              cancelAttempt();
              break;
            case "FALLBACK":
              setMode("pin");
              setMessage("Use your banking PIN to continue.");
              break;
            case "FAILED":
              setMessage(
                "Authentication did not complete. Retry biometrics or use your banking PIN.",
              );
              break;
          }
        },
        () =>
          setMessage(
            "Biometrics could not start. Retry or use your banking PIN.",
          ),
      ),
    [attemptId, cancelAttempt, runAuthentication, transfer],
  );

  const confirmPin = async (pin: string) => {
    if (usePinAttempts.getState().blockedUntil > Date.now()) {
      return;
    }

    await runAuthentication(
      async (isAuthenticationRunCurrent) => {
        setMessage(null);

        const failure = await transfer(attemptId, { method: "pin", pin });

        if (!isAuthenticationRunCurrent() || !failure) {
          return;
        }

        const { message, retryAt } = failure.error.error;

        if (retryAt) {
          blockUntil(Date.parse(retryAt));
        }

        setMessage(message);
      },
      () => setMessage("Could not verify your PIN. Please try again."),
    );
  };

  const switchToPin = () => {
    setMode("pin");
    setMessage(null);
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (method === "biometric") {
        void biometrics();
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [biometrics, method]);

  return {
    approving,
    mode,
    busy: isAuthenticating,
    message,
    remaining,
    biometrics,
    confirmPin,
    cancel: cancelAttempt,
    switchToPin,
  };
};
