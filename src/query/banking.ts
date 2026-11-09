import type { TApiResult } from "@/schemas/api.schema";
import { bankingService } from "@/services/index.services";
import { queryOptions } from "@tanstack/react-query";

type TFailure = Exclude<
  TApiResult<never, { error: { code: string; message: string } }>,
  { kind: "success" }
>;

export class ServiceError extends Error {
  constructor(public readonly failure: TFailure) {
    super(
      failure.kind === "api-error"
        ? failure.error.error.message
        : failure.kind === "transport-error"
          ? failure.message
          : "The service returned an invalid response.",
    );
    this.name = "ServiceError";
  }
}

export const unwrap = async <T>(
  result: Promise<TApiResult<T, { error: { code: string; message: string } }>>,
) => {
  const response = await result;

  if (response.kind === "success") {
    return response.data;
  }

  throw new ServiceError(response);
};

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
  queryFn: ({ signal }) => unwrap(bankingService.getAccount({}, { signal })),
  staleTime: 0,
  retry: retryRead,
});

export const RECIPIENTS_OPTIONS = queryOptions({
  queryKey: ["recipients"],
  queryFn: ({ signal }) => unwrap(bankingService.getRecipients({}, { signal })),
  staleTime: 5 * 60 * 1000,
  retry: retryRead,
});

export const transferOptions = (id: string) =>
  queryOptions({
    queryKey: ["transfer", id],
    queryFn: ({ signal }) =>
      unwrap(bankingService.getTransfer({ id }, { signal })),
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
