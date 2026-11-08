import { queryOptions } from "@tanstack/react-query";
import type { ApiResult } from "@/schemas/api.schema";
import { bankingService } from "@/services/index.services";

type Failure = Exclude<
  ApiResult<never, { error: { code: string; message: string } }>,
  { kind: "success" }
>;

export class ServiceError extends Error {
  constructor(public readonly failure: Failure) {
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

export async function unwrap<T>(
  result: Promise<ApiResult<T, { error: { code: string; message: string } }>>,
): Promise<T> {
  const response = await result;
  if (response.kind === "success") return response.data;
  throw new ServiceError(response);
}

export function retryRead(count: number, error: Error) {
  if (count >= 1 || !(error instanceof ServiceError)) return false;
  const failure = error.failure;
  return failure.kind === "transport-error"
    ? failure.reason !== "cancelled"
    : failure.kind === "api-error" &&
        (failure.status >= 500 || failure.status === 429);
}

export const accountOptions = queryOptions({
  queryKey: ["account"],
  queryFn: ({ signal }) => unwrap(bankingService.getAccount({}, { signal })),
  staleTime: 0,
  retry: retryRead,
});

export const recipientsOptions = queryOptions({
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
    // Completed transfers are immutable; submission already validated the receipt.
    staleTime: Infinity,
    retry: retryRead,
  });

export function isDefinitiveRejection(error: unknown) {
  if (!(error instanceof ServiceError) || error.failure.kind !== "api-error")
    return false;
  const { status, error: body } = error.failure;
  // These backend branches run before any debit. Conflicts/consumed approvals
  // and unknown HTTP failures cannot establish that no payment occurred.
  return (
    (status === 400 && body.error.code === "VALIDATION_ERROR") ||
    (status === 403 &&
      ["APPROVAL_INVALID", "APPROVAL_MISMATCH"].includes(body.error.code)) ||
    (status === 422 && body.error.code === "INSUFFICIENT_FUNDS")
  );
}
