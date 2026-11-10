import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useSubmitTransfer } from "@/hooks/useSubmitTransfer";
import { useTransferStore } from "@/stores/transfer";
import type { TTransferJourney } from "@/types/transfer.types";
import { getRejectionMessage } from "@/utils/transfer-error.utils";
import { randomUUID } from "expo-crypto";
import { router } from "expo-router";
import { Text } from "react-native";

type TSubmissionJourney = Extract<
  TTransferJourney,
  { status: "SUBMITTING" | "UNRESOLVED" | "REJECTED" }
>;

export const TransferSubmissionStatus = ({
  journey,
}: {
  journey: TSubmissionJourney;
}) => {
  const transfer = useSubmitTransfer();
  const pending = journey.status === "SUBMITTING";
  const unresolved = journey.status === "UNRESOLVED";

  const title = (() => {
    if (journey.status === "SUBMITTING") {
      return "Sending transfer";
    } else if (unresolved) {
      return "Transfer status unknown";
    }

    return "Transfer not completed";
  })();

  const authenticateButtonLabel = (() => {
    if (pending) {
      return `${title}…`;
    } else if (unresolved) {
      return "Retry transfer";
    }

    return "Authenticate again";
  })();

  const pendingMessage = `${title}… Keep the app open.`;

  const errorMessage =
    journey.status === "REJECTED" ? getRejectionMessage(journey.error) : null;

  const handleAuthenticate = () => {
    if (unresolved) {
      void transfer();
    } else {
      useTransferStore.getState().dispatch({
        type: "START_AUTHENTICATION",
        attemptId: randomUUID(),
        method: "biometric",
      });
    }
  };

  const handleBackToReview = () => router.dismissTo("/review");
  const handleEditDetails = () => router.dismissTo("/");

  return (
    <Page title={title}>
      {pending ? (
        <Text accessibilityLiveRegion="polite" className="text-base text-ink">
          {pendingMessage}
        </Text>
      ) : null}

      {errorMessage !== null ? <ErrorMessage message={errorMessage} /> : null}

      {unresolved ? (
        <Text className="text-base text-ink">
          We could not confirm whether this transfer completed. Retry uses the
          same payment request and can complete the payment if the original
          request never arrived. Closing the app loses this recovery
          information.
        </Text>
      ) : null}

      <Button
        label={authenticateButtonLabel}
        busy={pending}
        onPress={handleAuthenticate}
      />

      <Button
        label="Back to review"
        secondary
        disabled={pending || unresolved}
        onPress={handleBackToReview}
      />

      {journey.status === "REJECTED" ? (
        <Button label="Edit details" secondary onPress={handleEditDetails} />
      ) : null}
    </Page>
  );
};
