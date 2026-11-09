import { ApiError } from "./validation";
import type { TMockConfig, TTransferDetails } from "./validation";

type TApproval = { detailsKey: string; expiresAt: number; consumed: boolean };

type TTransfer = TTransferDetails & {
  id: string;
  reference: string;
  status: "completed";
  createdAt: string;
};

type TSubmission = { requestKey: string; transfer: TTransfer };

const RECIPIENTS = [
  { id: "aina", name: "Aina Rahman", account: "1234567890" },
  { id: "wei", name: "Lim Wei Jian", account: "2345678901" },
  { id: "priya", name: "Priya Nair", account: "3456789012" },
];

const defaultConfig = (): TMockConfig => {
  return {
    approvalOutcome: "approved",
    transferOutcome: "normal",
    responseDelayMs: 1000,
  };
};

export class MockBank {
  private balanceMinor = 500_000;
  private approvals = new Map<string, TApproval>();
  private transfers = new Map<string, TTransfer>();
  private submissions = new Map<string, TSubmission>();
  private config = defaultConfig();
  private failedOnce = false;

  account = () => {
    return {
      id: "demo-account",
      balanceMinor: this.balanceMinor,
      currency: "MYR",
    };
  };

  recipients = () => {
    return RECIPIENTS;
  };

  responseDelayMs = () => {
    return this.config.responseDelayMs;
  };

  configure = (update: Partial<TMockConfig>) => {
    this.config = { ...this.config, ...update };

    if (update.transferOutcome !== undefined) {
      this.failedOnce = false;
    }

    return { ...this.config };
  };

  reset = () => {
    this.balanceMinor = 500_000;
    this.approvals.clear();
    this.transfers.clear();
    this.submissions.clear();
    this.config = defaultConfig();
    this.failedOnce = false;

    return { account: this.account(), config: { ...this.config } };
  };

  authorize = (details: TTransferDetails) => {
    switch (this.config.approvalOutcome) {
      case "cancelled":
        throw new ApiError(
          403,
          "AUTHENTICATION_CANCELLED",
          "Transfer approval was cancelled.",
        );
      case "unavailable":
        throw new ApiError(
          503,
          "AUTHENTICATION_UNAVAILABLE",
          "The authentication method is unavailable.",
        );
      case "rejected":
        throw new ApiError(
          403,
          "AUTHENTICATION_REJECTED",
          "Transfer approval was rejected.",
        );
    }

    const now = Date.now();

    for (const [id, approval] of this.approvals) {
      if (approval.expiresAt <= now) {
        this.approvals.delete(id);
      }
    }

    const approvalId = crypto.randomUUID();
    const expiresAt = now + 5 * 60 * 1000;

    this.approvals.set(approvalId, {
      detailsKey: JSON.stringify(details),
      expiresAt,
      consumed: false,
    });

    return { approvalId, expiresAt: new Date(expiresAt).toISOString() };
  };

  submit = (
    details: TTransferDetails,
    approvalId: string,
    idempotencyKey: string,
  ) => {
    const detailsKey = JSON.stringify(details);
    const requestKey = JSON.stringify({ details, approvalId });
    const previous = this.submissions.get(idempotencyKey);

    // Replay must precede expiry/consumption checks and scripted failures.
    if (previous) {
      if (previous.requestKey !== requestKey) {
        throw new ApiError(
          409,
          "IDEMPOTENCY_CONFLICT",
          "This idempotencyKey belongs to another request.",
        );
      }

      return { transfer: previous.transfer, replayed: true };
    }

    const approval = this.approvals.get(approvalId);

    if (!approval || approval.expiresAt <= Date.now()) {
      throw new ApiError(
        403,
        "APPROVAL_INVALID",
        "The transfer approval is missing or expired.",
      );
    }

    if (approval.consumed) {
      throw new ApiError(
        409,
        "APPROVAL_CONSUMED",
        "This approval has already completed a transfer.",
      );
    }

    if (approval.detailsKey !== detailsKey) {
      throw new ApiError(
        403,
        "APPROVAL_MISMATCH",
        "The transfer details do not match the approval.",
      );
    }

    if (
      this.config.transferOutcome === "insufficient-funds" ||
      details.amountMinor > this.balanceMinor
    ) {
      throw new ApiError(
        422,
        "INSUFFICIENT_FUNDS",
        "The available balance is insufficient.",
      );
    }

    if (this.config.transferOutcome === "fail-once" && !this.failedOnce) {
      this.failedOnce = true;

      throw new ApiError(
        503,
        "TRANSFER_UNAVAILABLE",
        "The transfer service is temporarily unavailable. Retry the same request.",
      );
    }

    const id = crypto.randomUUID();

    const transfer: TTransfer = {
      ...details,
      id,
      reference: `DEMO-${id}`,
      status: "completed",
      createdAt: new Date().toISOString(),
    };

    // All state changes are synchronous: concurrent requests cannot interleave a debit.
    this.balanceMinor -= details.amountMinor;
    approval.consumed = true;
    this.transfers.set(id, transfer);
    this.submissions.set(idempotencyKey, { requestKey, transfer });

    return { transfer, replayed: false };
  };

  transfer = (id: string) => {
    const transfer = this.transfers.get(id);

    if (!transfer) {
      throw new ApiError(
        404,
        "TRANSFER_NOT_FOUND",
        "No completed transfer has this ID.",
      );
    }

    return transfer;
  };
}
