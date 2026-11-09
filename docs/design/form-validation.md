# Form validation

Use React Hook Form with `zodResolver` from `@hookform/resolvers/zod`.
Keep validation rules and messages in Zod schemas, with required, format, then
length checks. Display only the first issue per field. Keep form JSX explicit.

React Hook Form owns editable values, touched fields, attempted-submit state,
and errors. Change and blur both mark a field as interacted and validate it.
Show errors only when the field is touched or review/submit has been attempted.
Reset values and validation state together for a new form.

Connect native controls directly to RHF through `field.ref`. `Field` forwards
its ref to the native TextInput; the recipient selector forwards its ref to its
Pressable (or the manual-entry action when saved recipients are unavailable).

Use RHF's default automatic error focus. `TransferFormProvider` derives field
registration order from `TRANSFER_FORM_SCHEMA.keyof().options` before controls
mount so conditional fields keep that order. Declare schema keys in the intended
focus order; fields without a focusable ref, such as `recipientId`, are skipped
by automatic focus.
There is no custom focus scheduler or scroll-to-error behavior. `Page` retains
normal scrolling and keyboard avoidance.

## Transfer form

`src/schemas/transfer-form.schema.ts` defines the transfer rules and separate
schema input/output types: editable amounts are strings, parsed amounts are
integer minor units. `recipientId` retains only the saved recipient identifier;
resolve its current availability from Query when validating.

`TransferFormProvider` lives inside QueryProvider above the navigation stack.
It owns a single RHF instance shared by transfer, picker, review, authentication,
and confirmation routes. Set `shouldUnregister: false` to retain hidden manual
fields and their interaction history across mode changes and navigation.

Use `useTransferField` to bind text fields through `useController`'s `onChange`,
`onBlur`, and `ref`. Let RHF's validation mode schedule validation. To preserve
errors after the first edit, mark that first change touched through RHF's
`setValue` with `shouldTouch`; retain touched history when a value returns to its
default. Keep synchronous transfer locks and reviewed-snapshot invalidation
around field events.

`useTransferFormActions` contains only transfer-specific recipient selection
and combined form/journey reset. It does not replace RHF's
field event handlers or validation lifecycle.
Use `handleSubmit` for review and build the reviewed snapshot from the schema's
parsed output. Validation uses synchronous Zod rules; the store rejects review
transitions while the transfer is locked.

Zustand owns only the reviewed snapshot, completion ID, pending phase, unresolved
submission, and submission issue. Read recipients and account data from Query at
event time; retain only the recipient mode and ID in RHF. The resolver checks
recipient availability against the current cache. Revalidate when cached
recipient data changes without marking untouched fields as interacted. Refresh
alone leaves the reviewed snapshot unchanged.

| Field          | Rules                                                                                                                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recipient      | Select an available saved recipient or use manual entry. Only the active mode participates in validation.                                                                                                                   |
| Manual name    | Required after trimming, at least one Unicode letter, at most 100 UTF-16 units. Allow Unicode letters, combining marks, spaces, apostrophes, hyphens, periods, `/`, and `@`; reject digits and other symbols.               |
| Manual account | Exactly ten ASCII digits after trimming. Preserve leading zeros.                                                                                                                                                            |
| Amount         | Positive amount convertible exactly to safe integer minor units, at most two decimal places and 20 characters after trimming. Accept `.50`, `10.`, and leading zeros; reject commas, signs, symbols, and exponent notation. |
| Note           | Optional, at most 200 UTF-16 units after trimming. Preserve internal spaces and line breaks.                                                                                                                                |

Length errors preserve the full input, including pasted text. Do not truncate
values with `maxLength`. Preserve raw name, account, and note while editing;
trim them for the reviewed snapshot. Preserve the amount as typed on blur and
review; the Zod transform converts valid amounts to integer minor units for the
reviewed snapshot. Invalid amounts remain unchanged and are never rounded.

Manual name/account have separate errors. Switching recipient mode hides inactive
errors while retaining values and interaction history. Navigation preserves this
state too. An attempted review reveals all active errors; focus order is recipient,
name, account, amount, then note. Keep review enabled when account data exists so
the sender can discover errors. Without account data, review remains disabled.

An amount above the cached balance produces a nonblocking warning. Refreshes
update the warning; the service checks actual funds when submitting. Cached
balance remains useful during refresh or connection failure. Equality is valid.

Edits invalidate the reviewed snapshot. Identical-value updates remain no-ops.
Pending approval/submission and unresolved submissions block edits, blur events,
revalidation, and reset. Recovery keeps its original body and key.

Confirmation's Done action resets RHF values and interaction/submission state
alongside Zustand's reviewed/completion/issue state. State remains in memory;
restarting the app discards it.
