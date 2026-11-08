import { z } from "zod";

export const emptyRequest = z.object({});

export const errorResponse = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

export const nonblank = z.string().refine((value) => value.trim().length > 0);

export const recipient = z.object({
  name: nonblank,
  account: z.string().regex(/^\d{10}$/),
});

export const accountSchema = z.object({
  id: nonblank,
  balanceMinor: z.number().int().nonnegative(),
  currency: z.literal("MYR"),
});

export const transferDetails = z.object({
  recipient,
  amountMinor: z.number().int().positive(),
  currency: z.literal("MYR"),
  note: z.string().max(200).optional(),
});

export const completedTransfer = transferDetails.extend({
  note: z.string().max(200),
  id: nonblank,
  reference: nonblank,
  status: z.literal("completed"),
  createdAt: z.iso.datetime(),
});
