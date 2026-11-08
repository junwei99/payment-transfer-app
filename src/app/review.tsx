import { Details } from "@/components/transfer/Details";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { selectTransferLocked, useTransferStore } from "@/stores/transfer";
import { displayDetails } from "@/utils/transfer.utils";
import { Redirect, router } from "expo-router";
import { Text } from "react-native";
import { useShallow } from "zustand/react/shallow";

export default function ReviewScreen() {
  const { reviewed, completedId } = useTransferStore(
    useShallow((state) => ({
      reviewed: state.reviewed,
      completedId: state.completedId,
    })),
  );
  const locked = useTransferStore(selectTransferLocked);

  if (locked) {
    return <Redirect href="/authenticate" />;
  }

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
      title="Review transfer"
      subtitle="Take a moment to check the details."
    >
      <Details details={displayDetails(reviewed)} />
      <Button
        label="Continue"
        onPress={() => router.navigate("/authenticate")}
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
}
