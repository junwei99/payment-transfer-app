import { authentication } from "@/services/authentication";
import { useTransferStore } from "@/stores/transfer";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

type TAuthenticationOperation = (
  isAuthenticationRunCurrent: () => boolean,
) => Promise<void>;

export const useAuthenticationAttempt = (
  attemptId: string,
  initiallyAuthenticating: boolean,
) => {
  const [isAuthenticating, setIsAuthenticating] = useState(
    initiallyAuthenticating,
  );
  const isAttemptActive = useRef(false);
  const activeRunToken = useRef<symbol | null>(null);

  const isAttemptCurrent = useCallback(() => {
    const transferJourney = useTransferStore.getState().journey;

    return (
      isAttemptActive.current &&
      AppState.currentState !== "background" &&
      transferJourney.status === "AUTHENTICATING" &&
      transferJourney.attemptId === attemptId
    );
  }, [attemptId]);

  const cancelAttempt = useCallback(() => {
    if (
      !isAttemptActive.current ||
      !useTransferStore
        .getState()
        .dispatch({ type: "CANCEL_AUTHENTICATION", attemptId })
    ) {
      return;
    }

    isAttemptActive.current = false;
    activeRunToken.current = null;

    void authentication.cancel().catch(() => {});

    router.dismissTo("/review");
  }, [attemptId]);

  const runAuthentication = useCallback(
    async (
      authenticate: TAuthenticationOperation,
      onAuthenticationError: () => void,
    ) => {
      if (!isAttemptCurrent() || activeRunToken.current !== null) {
        return;
      }

      // The run token both locks concurrent runs and identifies stale results.
      const runToken = Symbol("authentication-run");
      activeRunToken.current = runToken;

      const isAuthenticationRunCurrent = () =>
        isAttemptCurrent() && activeRunToken.current === runToken;

      setIsAuthenticating(true);

      try {
        await authenticate(isAuthenticationRunCurrent);
      } catch {
        if (isAuthenticationRunCurrent()) {
          onAuthenticationError();
        }
      } finally {
        if (activeRunToken.current === runToken) {
          activeRunToken.current = null;

          if (isAttemptActive.current) {
            setIsAuthenticating(false);
          }
        }
      }
    },
    [isAttemptCurrent],
  );

  useEffect(() => {
    isAttemptActive.current = true;

    const appStateSubscription = AppState.addEventListener(
      "change",
      (appState) => {
        // Native biometric UI can make iOS inactive without backgrounding it.
        if (appState === "background") {
          cancelAttempt();
        }
      },
    );

    return () => {
      isAttemptActive.current = false;
      activeRunToken.current = null;
      appStateSubscription.remove();
      void authentication.cancel().catch(() => {});
    };
  }, [cancelAttempt]);

  return { isAuthenticating, runAuthentication, cancelAttempt };
};
