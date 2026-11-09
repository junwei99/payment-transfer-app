# Transfer draft actions

Implementation: complete

## Intent

Contain draft transition rules in the Zustand transfer store so consumers send
intent and required data instead of constructing the next draft.

## Agreed decisions

- Replace the draft updater API with one dispatcher accepting a discriminated
  action union.
- Action `type` values use UPPER_SNAKE_CASE.
- Represent draft recipient selection explicitly as none, saved, or manual,
  replacing the independently writable manual flag and recipient ID.
- Use the existing glossary term **recipient selection**. The programming action
  API does not introduce a new domain term.
- Scope is draft editing and recipient selection. Transfer approval, submission,
  and recovery orchestration remain in the existing hooks.
- Switching between saved and manual selection preserves manual name/account,
  amount, and note.
- An accepted edit clears only its corresponding field error: recipient for
  selection/name/account, amount for amount, and note for note. Unrelated field
  errors remain visible.
- Every accepted edit still invalidates the reviewed transfer and clears the
  completion ID and general issue.
- Preserve missing saved-recipient behavior: retain the selected ID, show no
  available selection plus a warning, and reject review while it is missing.
  If the same ID returns, it becomes selected again.
- Centralize selection resolution in a selector exported by transfer utilities,
  accepting the current recipient list. Do not mirror Query data in Zustand.
- Ignore identical-value actions without clearing review or errors. Ignore manual
  name/account actions unless manual entry is selected.
- Pending work or an unresolved submission blocks every draft action. Preserve
  the existing guarded `reset()` as a separate action.
- Preserve raw amount text during editing; validate at review.

## Action contract

The store method `dispatchDraftAction` accepts only these actions:

```ts
type TTransferDraftAction =
  | { type: "SELECT_SAVED_RECIPIENT"; recipientId: string }
  | { type: "SELECT_MANUAL_RECIPIENT" }
  | { type: "CHANGE_MANUAL_NAME"; name: string }
  | { type: "CHANGE_MANUAL_ACCOUNT"; account: string }
  | { type: "CHANGE_AMOUNT"; amount: string }
  | { type: "CHANGE_NOTE"; note: string };
```

Consumers pass intent and data, never a draft replacement or updater callback.
Selection, invalidation, error clearing, locking, and no-op rules belong in the
store and its pure transfer utilities. Screens retain navigation and rendering.

## Draft shape

```ts
type TTransferDraft = {
  recipientSelection:
    | { kind: "NONE" }
    | { kind: "SAVED"; recipientId: string }
    | { kind: "MANUAL" };
  manualRecipient: { name: string; account: string };
  amount: string;
  note: string;
};
```

Initial and reset state has no recipient selection and empty manual input, amount,
and note. Manual input lives separately from selection so it survives switching.

## Current behavior

- Draft writes are ignored during pending work or an unresolved submission.
- Every accepted draft write clears reviewed transfer, completion ID, general issue,
  and all field errors, even when the supplied values are unchanged.
- Switching selection preserves manual name/account, amount, and note.
- A missing saved recipient remains stored by ID. The UI shows no selection and a
  warning, and review rejects it. If that ID returns, selection resumes.
- Query owns API data; navigation remains in screens; the store validates and
  snapshots the draft at review.

## Implementation

The user confirmed shared understanding and authorized implementation. The agreed
contract is implemented in the transfer store and its consumers. Ongoing coding
guidance is captured in `docs/tech-choices.md`, already referenced by `AGENTS.md`.

## Validation

- Prettier formatted every changed file.
- `pnpm exec expo lint` passed.
- `pnpm exec tsc --noEmit` passed.
- Direct runtime checks using the actual Zustand store passed for all six actions,
  no-op subscriber notifications, retained manual input, raw amount editing,
  review validation, field-specific error clearing, review/completion/issue
  invalidation, missing/returning saved recipients, pending/unresolved locks, and
  reset. These ran through an in-memory TypeScript loader without adding a test
  framework.
- `git diff --check` passed. Mobile UI was not exercised.

## Follow-up

Move `reduceDraft` and `selectRecipientSelection` into
`src/utils/transfer.utils.ts`; the store and recipient section import them there.

## Explicit missing selection

`selectRecipientSelection` returns `TRecipientSelection` directly: none, manual,
saved with name/account, or missing with recipient ID. Remove the separate
`unavailable` flag. Only a loaded list can establish that a selected saved
recipient is missing; before data exists, resolve it as none without a missing
warning. The draft retains the saved ID so a returning recipient resolves again.
The form shows its existing warning for the missing result, and review rejects it.
