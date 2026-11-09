import { useOnline } from "@/hooks/useOnline";
import { isConnectionError } from "@/query/banking";
import type { FetchStatus } from "@tanstack/react-query";

/**
 *
 * `isOnline` reflects device connectivity; it does not guarantee API reachability.
 *
 * `connectionUnavailable` also includes a paused query or an API network/timeout error,
 * so it can remain true while the device is online until the query succeeds.
 *
 */
export const useConnectionStatus = (
  fetchStatus: FetchStatus,
  error: unknown,
) => {
  const isOnline = useOnline();
  const connectionUnavailable =
    !isOnline || fetchStatus === "paused" || isConnectionError(error);

  return { isOnline, connectionUnavailable };
};
