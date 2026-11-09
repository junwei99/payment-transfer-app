# Configurable form validation

Implementation: complete

## Intent

Design reusable Zod-based form handling, with TransferForm as its first consumer.
The user confirmed the contract and authorized implementation, including the
recommended nonblocking cached-balance warning.

## Confirmed decisions

- Each form configures its Zod schema. Keep validation behavior fixed: validate
  on change, blur, and review/submit. Do not add trigger configuration or
  field-level trigger overrides. Form JSX remains explicit rather than generated
  from configuration. Infer field names and value types from the schema.
- Validate immediately on every input change and show errors while the sender
  types. Error visibility does not wait for blur or attempted review.
- Design the form handling for reuse by future forms.
- Zustand continues owning the transfer draft and validation state. Values and
  interaction history survive navigation to the recipient picker and review.
- Manual name is required after trimming, needs at least one Unicode letter, and
  allows Unicode letters, combining marks, spaces, apostrophes, hyphens, periods,
  `/`, and `@`. Reject digits and other symbols. This checks format, not ownership.
  Manual account requires exactly ten ASCII digits after trimming,
  preserving leading zeros. Show separate name and account errors.
- Note is optional, trims surrounding whitespace for review, preserves internal
  spaces and line breaks, and has a 200 UTF-16-unit limit after normalization.
  Preserve raw name, account, and note text while editing.
- Maximum lengths after trimming: name 100 UTF-16 units, account 10 digits,
  amount 20 characters, note 200 UTF-16 units. Amount also requires safe integer
  minor units. Over-limit input remains intact with an immediate error; do not
  silently truncate input or paste.
- Review remains tappable when account data exists. An invalid review attempt
  validates all fields, reveals errors, and scrolls to/focuses the first invalid
  control.
- Recipient selection changes and refreshed recipient data trigger validation.
  Only the active recipient mode participates; retained manual-field errors do
  not invalidate saved-recipient mode.
- Cached balance can be stale. Retain a nonblocking warning when the amount
  exceeds it, update the warning on balance refresh, and let the service check
  funds at submission.
- Build a small shared form mechanism using existing Zod and Zustand dependencies.
  Each form supplies its schema, with fixed shared validation behavior. Keep
  transfer-specific rules in the transfer schema and utilities.
- A fresh form shows no errors. Change or blur reveals the affected field's
  validation; review reveals all errors. Editing one field does not expose errors
  on unrelated untouched fields.
- Accept `.50`; accept `10.` while editing and normalize it to `10.00` on blur or
  review. Reject invalid precision without rounding.
- Use cached balance during refresh or connection failure. Without account data,
  review is unavailable. An amount equal to balance is valid.
- Each trigger validates the entire active form synchronously without debounce.
  Until the first attempted review, show errors only for interacted fields.
  After an attempted review, all active-field errors remain visible and update
  immediately. Show one error per field, prioritizing required, format, then
  length errors.
- Preserve values and interaction history across navigation and recipient-mode
  switches. Hide errors belonging to the inactive mode. Explicit new-transfer
  reset clears draft values, interaction history, and validation state.
- Preserve pending-transfer and unresolved-submission locks on editing and reset.
- Normalization follows the field rules above; keep it specific to the form
  rather than adding a configurable normalization pipeline.

## Existing contracts to reconcile

- The completed transfer-draft-actions spec validates amounts at review and clears
  a field error on edit. Live validation replaces that behavior.
- docs/user-story-spec.md accepts `.50`, normalizes `10.` on blur, trims notes,
  and requires separate field errors. Current code rejects those amount inputs,
  preserves raw notes, and uses one combined recipient error.
- Amounts above cached balance retain the existing nonblocking warning; the
  service checks balance at submission.
- Query owns account and recipient data. Pending or unresolved transfers block
  draft edits and reset.

## Implementation and verification

- Shared schema validation and interaction/error state live in
  `src/utils/form-validation.utils.ts`. Transfer configuration lives in
  `src/schemas/transfer-form.schema.ts` and transfer form utilities.
- Zustand owns draft and validation state. UI actions read recipient context from
  Query at event time; recipient-cache changes revalidate without copying API
  data into the store.
- Shared `Form`/`Field` focus registration and `Page` scrolling support invalid
  review attempts. Native keyboard, scrolling, and assistive-technology behavior
  still need device verification.
- Ongoing guidance is in `docs/design/form-validation.md`, referenced by
  `AGENTS.md` and the technology choices.
- Prettier, Expo lint, TypeScript, and the Expo web export passed.
- Direct runtime checks against the actual store and schemas passed through a
  temporary TypeScript loader, without adding a test framework. Coverage includes
  fresh/interacted/submitted errors, blur, review normalization, Unicode names,
  UTF-16 note limits, preserved over-limit paste, exact and unsafe amounts,
  recipient mode/cache changes, no-op edits, pending/unresolved locks, and reset.
- A second schema with dependent fields verified reuse of the shared helper.
