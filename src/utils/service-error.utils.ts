import type { TApiErrorResponse, TApiFailure } from "@/schemas/api.schema";

export class ServiceError<
  TFailure extends TApiErrorResponse = TApiErrorResponse,
> extends Error {
  constructor(public readonly failure: TApiFailure<TFailure>) {
    let message = "The service returned an invalid response.";

    if (failure.kind === "api-error") {
      message = failure.error.error.message;
    } else if (failure.kind === "transport-error") {
      message = failure.message;
    }

    super(message);
    this.name = "ServiceError";
  }
}
