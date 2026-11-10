import { bankingService } from "@/services/index.services";
import type { TSubmission } from "@/types/transfer.types";
import { ServiceError } from "@/utils/service-error.utils";
import { mutationOptions, queryOptions } from "@tanstack/react-query";

export const retryRead = (count: number, error: Error) => {
  if (count >= 1 || !(error instanceof ServiceError)) {
    return false;
  }

  const failure = error.failure;

  return failure.kind === "transport-error"
    ? failure.reason !== "cancelled"
    : failure.kind === "api-error" &&
        (failure.status >= 500 || failure.status === 429);
};

export const isConnectionError = (error: unknown) => {
  if (!(error instanceof ServiceError)) {
    return false;
  }

  const { failure } = error;

  return (
    failure.kind === "transport-error" &&
    (failure.reason === "network" || failure.reason === "timeout")
  );
};

export const ACCOUNT_OPTIONS = queryOptions({
  queryKey: ["account"],
  queryFn: ({ signal }) => bankingService.getAccount({}, { signal }),
  staleTime: 0,
  retry: retryRead,
});

export const RECIPIENTS_OPTIONS = queryOptions({
  queryKey: ["recipients"],
  queryFn: ({ signal }) => bankingService.getRecipients({}, { signal }),
  staleTime: 5 * 60 * 1000,
  retry: retryRead,
});

export const SUBMIT_TRANSFER_OPTIONS = mutationOptions({
  mutationFn: (body: TSubmission) => bankingService.submitTransfer(body),
  retry: false,
  networkMode: "always",
  gcTime: 0,
});

export const transferOptions = (id: string) =>
  queryOptions({
    queryKey: ["transfer", id],
    queryFn: ({ signal }) => bankingService.getTransfer({ id }, { signal }),
    enabled: !!id.trim(),
    staleTime: Infinity,
    retry: retryRead,
  });

export const isDefinitiveRejection = (error: unknown) => {
  if (!(error instanceof ServiceError) || error.failure.kind !== "api-error") {
    return false;
  }

  const { status, error: body } = error.failure;

  return (
    (status === 400 && body.error.code === "VALIDATION_ERROR") ||
    (status === 403 &&
      ["APPROVAL_INVALID", "APPROVAL_MISMATCH"].includes(body.error.code)) ||
    (status === 422 && body.error.code === "INSUFFICIENT_FUNDS")
  );
};
