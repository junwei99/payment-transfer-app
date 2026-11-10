import { z } from "zod";

export const BANKING_PIN_SCHEMA = z.object({
  pin: z
    .string()
    .min(1, "Enter your banking PIN.")
    .regex(/^[0-9]+$/, "Use digits only.")
    .length(6, "Enter six digits."),
});
