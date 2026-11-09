import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useSubmitTransfer } from "@/hooks/useTransfer";
import { selectTransferLocked, useTransferStore } from "@/stores/transfer";
import { Redirect, router, usePreventRemove } from "expo-router";
import { Text } from "react-native";
import { useShallow } from "zustand/react/shallow";

const AuthenticateScreen = () => {
  const { reviewed, pending, issue, unresolved, completedId } =
    useTransferStore(
      useShallow((state) => ({
        reviewed: state.reviewed,
        pending: state.pending,
        issue: state.issue,
        unresolved: state.unresolved,
        completedId: state.completedId,
      })),
    );

  const transfer = useSubmitTransfer();
  const locked = useTransferStore(selectTransferLocked);

  const authenticateBtnText = pending
    ? "Processing…"
    : unresolved
      ? "Retry transfer"
      : "Simulate authentication";

  usePreventRemove(locked, () => {});

  if (completedId) {
    return (
      <Redirect
        href={{ pathname: "/confirmation", params: { id: completedId } }}
      />
    );
  }

  if (!reviewed) {
    return <Redirect href="/" />;
  }

  return (
    <Page
      title={
        pending
          ? "Processing transfer"
          : unresolved
            ? "Transfer status unknown"
            : "Simulated authentication"
      }
    >
      <Text accessibilityLiveRegion="polite" className="text-base text-ink">
        {pending
          ? "Waiting for the service. Keep the app open."
          : "Authentication is simulated. This does not use device security or collect credentials. Approval and payment are processed by the simulated backend."}
      </Text>

      {issue ? <ErrorMessage message={issue} /> : null}

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

      {issue && !locked ? (
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
