import { StatusNotice } from "@/components/ui/StatusNotice";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { RECIPIENTS_OPTIONS } from "@/query/banking";
import { useQuery } from "@tanstack/react-query";

export const RecipientLoadStatus = () => {
  const recipients = useQuery(RECIPIENTS_OPTIONS);

  const { isOnline, connectionUnavailable } = useConnectionStatus(
    recipients.fetchStatus,
    recipients.error,
  );

  if (recipients.isFetching) {
    return null;
  }

  if (!connectionUnavailable && !recipients.error) {
    return null;
  }

  const hasRecipients = !!recipients.data;

  const title = hasRecipients
    ? "Recipients may be out of date"
    : "Can't load your recipients";

  const explanation = connectionUnavailable
    ? isOnline
      ? "We couldn't connect."
      : "You're offline."
    : "We couldn't retrieve your recipients.";

  const cachedMessage = hasRecipients
    ? " Your saved list is still available."
    : "";

  const refreshMessage = isOnline
    ? " Pull down to refresh."
    : " Pull down to refresh when connected.";

  return (
    <StatusNotice
      variant={connectionUnavailable ? "connection-error" : "error"}
      title={title}
      message={`${explanation}${cachedMessage}${refreshMessage} You can also enter a recipient manually.`}
    />
  );
};
