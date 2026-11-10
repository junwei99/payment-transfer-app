import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAuthenticationChallenge } from "@/hooks/useAuthenticationChallenge";
import { BankingPinForm } from "@/screens/authenticate/components/BankingPinForm";
import { Text } from "react-native";

export const AuthenticationChallenge = ({
  attemptId,
  method,
}: {
  attemptId: string;
  method: "biometric" | "pin";
}) => {
  const {
    approving,
    mode,
    busy,
    message,
    remaining,
    biometrics,
    confirmPin,
    cancel,
    switchToPin,
  } = useAuthenticationChallenge({ attemptId, method });

  if (approving) {
    return <Button label="Approving transfer…" busy onPress={cancel} />;
  }

  return (
    <>
      <Text className="text-base text-ink">
        Authenticate to approve this transfer.
      </Text>

      {message ? <ErrorMessage message={message} /> : null}

      {mode === "pin" ? (
        <>
          {remaining > 0 ? (
            <Text
              accessibilityLiveRegion="polite"
              className="text-base text-ink"
            >
              Too many incorrect attempts. Try again in {remaining} seconds.
            </Text>
          ) : null}

          <BankingPinForm
            disabled={remaining > 0 || busy}
            onConfirm={(pin) => {
              void confirmPin(pin);
            }}
            busy={busy}
          />
        </>
      ) : (
        <Button
          label={busy ? "Authenticating…" : "Retry biometrics"}
          busy={busy}
          onPress={() => {
            void biometrics();
          }}
        />
      )}

      {mode === "pin" ? (
        <Button
          label="Use biometrics"
          secondary
          disabled={busy}
          onPress={() => {
            void biometrics();
          }}
        />
      ) : (
        <Button
          label="Use banking PIN"
          secondary
          disabled={busy}
          onPress={() => {
            switchToPin();
          }}
        />
      )}

      <Button label="Back to review" secondary onPress={cancel} />
    </>
  );
};
