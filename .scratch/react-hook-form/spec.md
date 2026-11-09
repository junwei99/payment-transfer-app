# Transfer form migration to React Hook Form

Status: implemented

## Goal

Replace custom form-state and validation machinery with React Hook Form while
preserving the existing per-field Zod rules and transfer behavior.

## Agreed decisions

- React Hook Form is the sole owner of editable draft values, interaction state,
  attempted review state, and field errors. Do not mirror these into Zustand.
- Zustand retains the reviewed transfer, completion ID, approval/submission
  status, unresolved submission, and submission issues.
- Place one persistent form provider inside QueryProvider and above the existing
  navigation stack. Connect native control refs directly to RHF for automatic
  error focus; omit custom scroll-to-error behavior.
- Preserve draft values and interaction history across recipient selection,
  review, and navigation. Inactive manual fields retain values and history but
  do not participate in validation.
- Preserve change, blur, and review validation timing. Only interacted fields
  reveal errors until an attempted review reveals all active errors. Show the
  first Zod issue per field.
- Keep existing Zod field rules, messages, input/output transformations, and
  explicit form JSX. Use the schema's parsed output for the reviewed snapshot.
- Remove the custom validation helper and draft-action reducer once replaced.
  Keep a small guarded interface for recipient selection, amount normalization,
  and resetting the transfer journey.
- Preserve error and warning styling and the nonblocking balance warning.
- Preserve synchronous edit, normalization, revalidation, review, and reset
  guards during approval, submission, and unresolved recovery. Preserve the
  exact unresolved submission body and idempotency key.
- Update existing technology and form-validation documentation with the new
  ownership and integration contract.

## Behavior to preserve

- Identical-value updates are no-ops. Real edits invalidate the reviewed
  snapshot and clear obsolete completion and submission issue state.
- Valid amounts normalize to two decimal places on blur and review; invalid
  amounts remain unchanged. Names, accounts, and notes remain raw during editing
  and trim into the reviewed snapshot.
- Recipient cache changes revalidate without marking untouched fields as
  interacted. Keep the selected recipient ID so a returning recipient resolves
  automatically. Refresh alone does not rewrite the reviewed snapshot.
- Invalid review focuses the first invalid active control in
  recipient, name, account, amount, then note order. Non-text recipient controls
  remain valid focus targets.
- Done on confirmation resets both the form and transfer journey before returning
  home. App restart discards in-memory state.
- Query continues to own account and recipient data; do not copy query responses
  into form or Zustand state.

## Verification

Format all changed files with the required Prettier command, then run Expo lint
and TypeScript checks. iOS and Android visual and interaction verification stays
with the user, following the styling guide. Flag any behavior that cannot be
preserved directly before changing it.

## Result

Implemented the persistent RHF provider, Zod resolver, field bindings, guarded
form actions, and combined reset. Removed the custom validation helper and draft
reducer, and updated the technology and validation guides. Prettier, Expo lint,
TypeScript, and diff whitespace checks passed. Device interaction verification
remains with the user.

The follow-up focus cleanup removed the custom Form wrapper, field map, focus
context, and imperative form handle. Controls now register focus adapters through
RHF's field.ref, and invalid review uses RHF's automatic error focus in the agreed field order.

Further cleanup replaced the custom change/blur functions with useController's
handlers and removed manual invalid-submit focus state and effects. RHF's default
error focus uses fields registered in the agreed order. The remaining form
actions handle transfer-specific normalization, recipient selection, and reset;
the field adapter preserves transfer locks and first-edit error visibility.

At the user's request, removed the native scrolling adapter, Page scroll context,
and measurement refs. Native control refs now connect directly to RHF, which
owns automatic error focus without a custom animation-frame scheduler. Normal
page scrolling and keyboard avoidance remain available.
