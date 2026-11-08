import { z } from "zod";

export const EMPTY_REQUEST = z.object({});

export const ERROR_RESPONSE = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

export const NONBLANK = z.string().refine((value) => value.trim().length > 0);

export const RECIPIENT = z.object({
  name: NONBLANK,
  account: z.string().regex(/^\d{10}$/),
});

export const ACCOUNT_SCHEMA = z.object({
  id: NONBLANK,
  balanceMinor: z.number().int().nonnegative(),
  currency: z.literal("MYR"),
});

export const TRANSFER_DETAILS = z.object({
  recipient: RECIPIENT,
  amountMinor: z.number().int().positive(),
  currency: z.literal("MYR"),
  note: z.string().max(200).optional(),
});

export const COMPLETED_TRANSFER = TRANSFER_DETAILS.extend({
  note: z.string().max(200),
  id: NONBLANK,
  reference: NONBLANK,
  status: z.literal("completed"),
  createdAt: z.iso.datetime(),
});
