export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly retryAt?: string,
  ) {
    super(message);
  }
}

export type TTransferDetails = {
  recipient: { name: string; account: string };
  amountMinor: number;
  currency: "MYR";
  note: string;
};

export type TMockConfig = {
  approvalOutcome: "approved" | "cancelled" | "unavailable" | "rejected";
  transferOutcome: "normal" | "insufficient-funds" | "fail-once";
  responseDelayMs: number;
};

const invalid: (message: string) => never = (message: string) => {
  throw new ApiError(400, "VALIDATION_ERROR", message);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const object = (
  value: unknown,
  allowedKeys: string[],
): Record<string, unknown> => {
  if (!isRecord(value)) {
    invalid("Expected a JSON object.");
  }

  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) {
      invalid(`Unknown field: ${key}.`);
    }
  }

  return value;
};

export const requiredString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value.trim()) {
    invalid(`${field} is required.`);
  }

  return value.trim();
};

export const readJson = async (request: Request): Promise<unknown> => {
  const contentType = request.headers
    .get("content-type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    throw new ApiError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Use Content-Type: application/json.",
    );
  }

  try {
    return await request.json();
  } catch {
    throw new ApiError(
      400,
      "INVALID_JSON",
      "The request body must be valid JSON.",
    );
  }
};

export const transferRequest = (value: unknown, submission = false) => {
  const body = object(value, [
    "recipient",
    "amountMinor",
    "currency",
    "note",
    ...(submission ? ["approvalId", "idempotencyKey"] : ["authentication"]),
  ]);

  const recipient = object(body.recipient, ["name", "account"]);
  const name = requiredString(recipient.name, "recipient.name");
  const account = requiredString(recipient.account, "recipient.account");

  if (!/^\d{10}$/.test(account)) {
    invalid("recipient.account must contain exactly 10 digits.");
  }

  if (
    typeof body.amountMinor !== "number" ||
    !Number.isSafeInteger(body.amountMinor) ||
    body.amountMinor <= 0
  ) {
    invalid("amountMinor must be a positive safe integer.");
  }

  if (body.currency !== "MYR") {
    invalid("currency must be MYR.");
  }

  const note = body.note === undefined ? "" : body.note;

  if (typeof note !== "string" || note.length > 200) {
    invalid("note must be a string of at most 200 characters.");
  }

  const details: TTransferDetails = {
    recipient: { name, account },
    amountMinor: body.amountMinor,
    currency: "MYR",
    note,
  };

  const idempotencyKey = submission
    ? requiredString(body.idempotencyKey, "idempotencyKey")
    : "";

  if (idempotencyKey.length > 200) {
    invalid("idempotencyKey must be at most 200 characters.");
  }

  return {
    idempotencyKey,
    details,
    approvalId: submission ? requiredString(body.approvalId, "approvalId") : "",
  };
};

export const configRequest = (value: unknown): Partial<TMockConfig> => {
  const body = object(value, [
    "approvalOutcome",
    "transferOutcome",
    "responseDelayMs",
  ]);

  const config: Partial<TMockConfig> = {};
  const { approvalOutcome, transferOutcome, responseDelayMs } = body;

  if (approvalOutcome !== undefined) {
    if (
      approvalOutcome !== "approved" &&
      approvalOutcome !== "cancelled" &&
      approvalOutcome !== "unavailable" &&
      approvalOutcome !== "rejected"
    ) {
      invalid(
        "approvalOutcome must be approved, cancelled, unavailable, or rejected.",
      );
    }

    config.approvalOutcome = approvalOutcome;
  }

  if (transferOutcome !== undefined) {
    if (
      transferOutcome !== "normal" &&
      transferOutcome !== "insufficient-funds" &&
      transferOutcome !== "fail-once"
    ) {
      invalid(
        "transferOutcome must be normal, insufficient-funds, or fail-once.",
      );
    }

    config.transferOutcome = transferOutcome;
  }

  if (responseDelayMs !== undefined) {
    if (
      typeof responseDelayMs !== "number" ||
      !Number.isInteger(responseDelayMs) ||
      responseDelayMs < 0 ||
      responseDelayMs > 30_000
    ) {
      invalid("responseDelayMs must be an integer between 0 and 30000.");
    }

    config.responseDelayMs = responseDelayMs;
  }

  return config;
};

export type TAuthentication =
  { method: "biometric"; success: true } | { method: "pin"; pin: string };

export const authenticationRequest = (value: unknown): TAuthentication => {
  const body = object(value, ["method", "success", "pin"]);

  if (
    body.method === "biometric" &&
    body.success === true &&
    body.pin === undefined
  ) {
    return { method: "biometric", success: true };
  }

  if (
    body.method === "pin" &&
    typeof body.pin === "string" &&
    /^\d{6}$/.test(body.pin) &&
    body.success === undefined
  ) {
    return { method: "pin", pin: body.pin };
  }

  return invalid(
    "A successful biometric result or six-digit banking PIN is required.",
  );
};

export const authorizationRequest = (value: unknown) => {
  const body = object(value, [
    "recipient",
    "amountMinor",
    "currency",
    "note",
    "authentication",
  ]);

  return {
    details: transferRequest(body).details,
    authentication: authenticationRequest(body.authentication),
  };
};
