import { Page } from "@/components/layout/Page";
import { Details } from "@/components/transfer/Details";
import { Button } from "@/components/ui/Button";
import { selectTransferLocked, useTransferStore } from "@/stores/transfer";
import { Redirect, router } from "expo-router";
import { randomUUID } from "expo-crypto";
import { Text } from "react-native";

const ReviewScreen = () => {
  const journey = useTransferStore((state) => state.journey);
  const locked = useTransferStore(selectTransferLocked);

  if (locked) {
    return <Redirect href="/authenticate" />;
  }

  if (journey.status === "COMPLETED") {
    return (
      <Redirect
        href={{ pathname: "/confirmation", params: { id: journey.id } }}
      />
    );
  }

  if (journey.status !== "REVIEWED" && journey.status !== "REJECTED") {
    return <Redirect href="/" />;
  }

  const authenticate = (method: "biometric" | "pin") => {
    if (
      useTransferStore.getState().dispatch({
        type: "START_AUTHENTICATION",
        attemptId: randomUUID(),
        method,
      })
    ) {
      router.navigate("/authenticate");
    }
  };

  return (
    <Page
      title="Review transfer"
      subtitle="Take a moment to check the details."
    >
      <Details details={journey.details} />

      <Button
        label="Confirm transfer"
        onPress={() => authenticate("biometric")}
      />
      <Button
        label="Use banking PIN"
        secondary
        onPress={() => authenticate("pin")}
      />
      <Button
        label="Edit details"
        secondary
        onPress={() => router.dismissTo("/")}
      />

      <Text className="text-sm text-secondary">
        This uses a simulated backend. No real money will move.
      </Text>
    </Page>
  );
};

export default ReviewScreen;
