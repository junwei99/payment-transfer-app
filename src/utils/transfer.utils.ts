import type { ReviewedTransfer, TransferDetails } from "@/types/transfer.types";

export function formatMinor(minor: number) {
  const digits = String(minor).padStart(3, "0");
  return `${digits.slice(0, -2)}.${digits.slice(-2)}`;
}

export function parseAmount(value: string): number | null {
  const amount = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) return null;
  const [whole, fraction = ""] = amount.split(".");
  const minor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  return minor > 0n && minor <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(minor)
    : null;
}

export function displayDetails(details: ReviewedTransfer): TransferDetails {
  return {
    name: details.recipient.name,
    account: details.recipient.account,
    amount: formatMinor(details.amountMinor),
    currency: details.currency,
    note: details.note ?? "",
  };
}
