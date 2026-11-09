# Code of conduct

Follow these conventions when writing or modifying TypeScript and React
Native code.

## Naming

| Item                   | Convention                                   | Example                                   |
| ---------------------- | -------------------------------------------- | ----------------------------------------- |
| Variables              | camelCase                                    | `recipientName`, `transferAmount`         |
| Constants              | UPPER_SNAKE_CASE                             | `MAX_TRANSFER_AMOUNT`, `API_TIMEOUT_MS`   |
| React component files  | PascalCase                                   | `TransferForm.tsx`, `PrimaryButton.tsx`   |
| Hook files             | camelCase or kebab-case, starting with `use` | `useTransfer.ts`, `use-transfer.ts`       |
| Other TypeScript files | kebab-case                                   | `transfer-store.ts`, `requestor.utils.ts` |
| Type aliases           | PascalCase prefixed with `T`                 | `TTransfer`, `TTransferFormProps`         |
| Interfaces             | PascalCase prefixed with `I`                 | `ITransferService`, `IButtonProps`        |

Use UPPER_SNAKE_CASE for fixed constants such as limits and configuration values.
Runtime variables declared with `const`, such as component props, hook results,
and calculated values, use camelCase. React component identifiers use PascalCase.

Preserve framework-required filenames, including Expo Router's `index.tsx` and
`_layout.tsx`. Route filenames follow their URL names. Keep required declaration
and configuration filenames, such as `expo-env.d.ts` and `tsconfig.json`.

## Imports

Always use configured absolute aliases for project-local imports. In the client,
use `@/…` for source files and `@/assets/…` for asset `require` calls. Relative
paths starting with `./` or `../` are not allowed. Apply the same rule to type
imports, re-exports, and dynamic imports. Keep package imports as package names.

```ts
import { Button } from "@/components/ui/Button";
import type { TTransferDraft } from "@/types/transfer.types";
import { useQuery } from "@tanstack/react-query";

const branchImage = require("@/assets/images/botanical-branch.svg");
```

## Functions

Use arrow functions for React components, hooks, utilities, and callbacks instead of traditional `function` declarations or expressions. Declare named arrow functions with `const`.

```ts
const formatAmount = (amount: number): string => amount.toFixed(2);
```

## Spacing and logical groups

Separate logical groups with one blank line: guard clauses, related declarations,
helper functions, event subscriptions, asynchronous work, and cleanup or return
blocks. Keep statements that perform the same small task together. Apply this
grouping inside callbacks and hooks as well as between top-level declarations.
Keep file imports in one contiguous block with no blank lines between import
statements. Use one blank line between the import block and the rest of the file.

```ts
if (isLocked) {
  return;
}

const amountMinor = parseAmount(amount);
const recipient = recipients.find(({ id }) => id === recipientId);

setDraft({ amountMinor, recipient });

return recipient;
```

## Conditionals

Always use curly braces for `if`, `else if`, and `else` blocks, including blocks
containing a single return or assignment.

```ts
if (isLocked) {
  return;
}

if (isApproved) {
  transfer.status = "approved";
}
```
