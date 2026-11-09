import { MAX_AMOUNT_INPUT_LENGTH, parseAmount } from "@/utils/transfer.utils";
import { z } from "zod";

export const TRANSFER_FIELD_LIMITS = {
  name: 100,
  account: 10,
  amount: MAX_AMOUNT_INPUT_LENGTH,
  note: 200,
} as const;

const MANUAL_NAME = z
  .string()
  .trim()
  .min(1, "Enter a recipient name.")
  .refine(
    (value) =>
      /\p{L}/u.test(value) && /^[\p{L}\p{M}\p{Zs}'\u2019.\/@-]+$/u.test(value),
    "Use letters, spaces, apostrophes, hyphens, periods, / or @ for the name.",
  )
  .refine(
    (value) => value.length <= TRANSFER_FIELD_LIMITS.name,
    "Use at most 100 characters for the name.",
  );

const MANUAL_ACCOUNT = z
  .string()
  .trim()
  .min(1, "Enter an account number.")
  .regex(/^\d+$/, "Use digits only for the account number.")
  .length(
    TRANSFER_FIELD_LIMITS.account,
    "Enter exactly ten digits for the account number.",
  );

const AMOUNT = z
  .string()
  .trim()
  .min(1, "Enter an amount.")
  .refine(
    (value) => /^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(value),
    "Enter an amount with at most two decimal places, without commas or symbols.",
  )
  .refine(
    (value) =>
      value.length > TRANSFER_FIELD_LIMITS.amount ||
      parseAmount(value) !== null,
    "Enter a positive amount within the supported limit.",
  )
  .refine(
    (value) => value.length <= TRANSFER_FIELD_LIMITS.amount,
    "Use at most 20 characters for the amount.",
  )
  .transform((value) => parseAmount(value) ?? 0);

export const TRANSFER_FORM_SCHEMA = z
  .object({
    recipient: z.enum(["NONE", "MANUAL", "SAVED", "MISSING"]),
    recipientId: z.string(),
    name: z.string(),
    account: z.string(),
    amount: AMOUNT,
    note: z
      .string()
      .trim()
      .refine(
        (value) => value.length <= TRANSFER_FIELD_LIMITS.note,
        "Use at most 200 characters for the note.",
      ),
  })
  .superRefine((values, context) => {
    if (values.recipient === "NONE" || values.recipient === "MISSING") {
      context.addIssue({
        code: "custom",
        path: ["recipient"],
        message:
          values.recipient === "MISSING"
            ? "Recipient no longer available. Choose another recipient."
            : "Choose a recipient or enter account details manually.",
      });
    }

    if (values.recipient === "MANUAL") {
      const fields = { name: MANUAL_NAME, account: MANUAL_ACCOUNT };

      for (const field of ["name", "account"] as const) {
        const result = fields[field].safeParse(values[field]);

        if (!result.success) {
          for (const issue of result.error.issues) {
            context.addIssue({
              code: "custom",
              path: [field],
              message: issue.message,
            });
          }
        }
      }
    }
  });

export type TTransferFormValues = z.input<typeof TRANSFER_FORM_SCHEMA>;
export type TTransferFormOutput = z.output<typeof TRANSFER_FORM_SCHEMA>;
export type TTransferField = Exclude<keyof TTransferFormValues, "recipientId">;
