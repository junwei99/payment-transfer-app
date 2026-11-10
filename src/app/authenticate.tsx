import { Page } from "@/components/layout/Page";
import { AuthenticationChallenge } from "@/screens/authenticate/components/AuthenticationChallenge";
import { TransferSubmissionStatus } from "@/screens/authenticate/components/TransferSubmissionStatus";
import { useTransferStore } from "@/stores/transfer";
import { Redirect, useNavigation, usePreventRemove } from "expo-router";

const AuthenticateScreen = () => {
  const journey = useTransferStore((state) => state.journey);
  const navigation = useNavigation();

  const pending =
    journey.status === "APPROVING" || journey.status === "SUBMITTING";

  const unresolved = journey.status === "UNRESOLVED";
  const authenticating = journey.status === "AUTHENTICATING";

  usePreventRemove(pending || unresolved || authenticating, ({ data }) => {
    const current = useTransferStore.getState();

    if (current.journey.status === "AUTHENTICATING") {
      current.dispatch({
        type: "CANCEL_AUTHENTICATION",
        attemptId: current.journey.attemptId,
      });
      navigation.dispatch(data.action);
    } else if (current.journey.status === "REVIEWED") {
      navigation.dispatch(data.action);
    }
  });

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

  if (journey.status === "REVIEWED") {
    return <Redirect href="/review" />;
  }

  if (journey.status === "AUTHENTICATING" || journey.status === "APPROVING") {
    return (
      <Page title="Approve transfer">
        <AuthenticationChallenge
          key={journey.attemptId}
          attemptId={journey.attemptId}
          method={journey.method}
        />
      </Page>
    );
  }

  return <TransferSubmissionStatus journey={journey} />;
};

export default AuthenticateScreen;
