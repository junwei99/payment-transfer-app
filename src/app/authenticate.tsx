import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useSubmitTransfer } from "@/hooks/useSubmitTransfer";
import { selectTransferLocked, useTransferStore } from "@/stores/transfer";
import { getRejectionMessage } from "@/utils/transfer-error.utils";
import { Redirect, router, usePreventRemove } from "expo-router";
import { Text } from "react-native";

const AuthenticateScreen = () => {
  const journey = useTransferStore((state) => state.journey);

  const transfer = useSubmitTransfer();

  const locked = useTransferStore(selectTransferLocked);

  const pending =
    journey.status === "APPROVING" || journey.status === "SUBMITTING";

  const unresolved = journey.status === "UNRESOLVED";

  const errorMessage = (() => {
    if (journey.status === "UNRESOLVED") {
      return "We couldn't confirm whether this transfer completed.";
    }

    return journey.status === "REJECTED"
      ? getRejectionMessage(journey.error)
      : null;
  })();

  const authenticateBtnText = (() => {
    if (pending) {
      return journey.status === "SUBMITTING"
        ? "Sending transfer…"
        : "Approving transfer…";
    }

    return unresolved ? "Retry transfer" : "Simulate authentication";
  })();

  const title = (() => {
    if (pending) {
      return journey.status === "SUBMITTING"
        ? "Sending transfer"
        : "Approving transfer";
    }

    return unresolved ? "Transfer status unknown" : "Simulated authentication";
  })();

  const description = (() => {
    if (pending) {
      return journey.status === "SUBMITTING"
        ? "Sending transfer. Keep the app open."
        : "Approving transfer. Keep the app open.";
    }

    return "Authentication is simulated. This does not use device security or collect credentials. Approval and payment are processed by the simulated backend.";
  })();

  usePreventRemove(locked, () => {});

  if (journey.status === "COMPLETED") {
    return (
      <Redirect
        href={{ pathname: "/confirmation", params: { id: journey.id } }}
      />
    );
  }

  if (journey.status === "IDLE") {
    return <Redirect href="/" />;
  }

  return (
    <Page title={title}>
      <Text accessibilityLiveRegion="polite" className="text-base text-ink">
        {description}
      </Text>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      {unresolved && !pending ? (
        <Text className="text-base text-ink">
          Retry uses the same payment request. It can complete the payment if
          the original request never arrived. Keep the app open; closing it
          loses this recovery information.
        </Text>
      ) : null}

      <Button
        label={authenticateBtnText}
        disabled={pending}
        busy={pending}
        onPress={() => {
          void transfer();
        }}
      />

      <Button
        label="Back to review"
        secondary
        disabled={locked}
        onPress={() => router.dismissTo("/review")}
      />

      {journey.status === "REJECTED" ? (
        <Button
          label="Edit details"
          secondary
          onPress={() => router.dismissTo("/")}
        />
      ) : null}
    </Page>
  );
};

export default AuthenticateScreen;
