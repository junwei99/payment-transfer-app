# Transfer journey dispatch

## Agreed boundaries

All transfer journey transitions pass through a typed dispatch action in the
Zustand store, including approval and submission outcomes from
`useSubmitTransfer`.

Dispatch owns transition legality. Edit-related actions check the synchronous
transfer lock. Approval and submission actions check their allowed source states;
the lock must not prevent pending operations from settling or unresolved
submissions from retrying.

React Hook Form continues to own editable values and validation. The orchestration
hook continues to own API calls; navigation stays outside the store.

Existing recovery behavior remains required: unresolved submissions reuse the
exact authorized request and idempotency key, while definitive rejection allows
fresh approval of reviewed details.

Actions express intent or outcomes rather than supplying arbitrary next journey
objects. The store derives the next journey from its current state and the
action's required payload. In particular, retry derives the submission from the
unresolved journey rather than accepting a replacement request.

Dispatch returns a synchronous boolean: `true` for an accepted action and `false`
for a blocked or invalid action. Rejected actions leave state unchanged. Callers
must stop dependent side effects after rejection, including API calls and RHF
reset.

Field edits, recipient selection, reset, and review proceed only after dispatch
accepts their action; these callers do not need a separate lock check. Keep
`selectTransferLocked` for UI state, navigation, blur events, and cache-driven
validation, which are not guarded by an accepted dispatch action.

Keep the writable Zustand store private. Consumers receive selector-based React
access, imperative reads, subscriptions, and dispatch, without public `setState`
access. All journey writes must pass through dispatch.

Use source-state checks without adding an operation ID for now. Pending states
are entered synchronously, and reset and replacement attempts remain blocked
until the pending operation settles. Revisit operation identity if cancellation,
replacement, or concurrent attempts become supported. This decision does not
change submission idempotency keys.

Keep a pure `transitionJourney(journey, action)` function in `transfer.ts`.
It returns the next journey for an accepted action and `null` for a rejected
action. Dispatch calls it synchronously, saves an accepted journey, and returns
the acceptance boolean. API calls and other side effects stay outside this
function.

## Actions

| Action                  | Accepted from          | Next state                                   |
| ----------------------- | ---------------------- | -------------------------------------------- |
| `REVIEW`                | Any unlocked state     | `REVIEWED` with supplied details             |
| `INVALIDATE_REVIEW`     | Any unlocked state     | `IDLE`                                       |
| `RESET`                 | Any unlocked state     | `IDLE`; caller also resets RHF               |
| `START_APPROVAL`        | `REVIEWED`, `REJECTED` | `APPROVING` with reviewed details            |
| `APPROVAL_SUCCEEDED`    | `APPROVING`            | `SUBMITTING`                                 |
| `APPROVAL_FAILED`       | `APPROVING`            | `REJECTED` with failure                      |
| `RETRY_SUBMISSION`      | `UNRESOLVED`           | `SUBMITTING` with the original request       |
| `SUBMISSION_SUCCEEDED`  | `SUBMITTING`           | `COMPLETED` with transfer ID                 |
| `SUBMISSION_REJECTED`   | `SUBMITTING`           | `REJECTED` with reviewed details and failure |
| `SUBMISSION_UNRESOLVED` | `SUBMITTING`           | `UNRESOLVED` with the exact request          |

`APPROVAL_SUCCEEDED` takes the backend's approval ID and a new idempotency key
created by the hook. The store combines them with its reviewed details. The hook
reads the accepted submission from the store before sending it. Approval IDs
remain part of the existing API contract.

`SUBMISSION_REJECTED` explicitly copies reviewed fields, excluding approval ID
and idempotency key. `INVALIDATE_REVIEW` and `RESET` share a result but retain
separate names to distinguish editing from resetting the whole form.

Seed the receipt cache before dispatching completion so the confirmation route
can read it immediately. Invalidate the account query after accepted completion.

## Verification

Run `node --experimental-strip-types --test scripts/transfer-store.test.mjs`
with Node supporting TypeScript stripping. These tests cover synchronous duplicate
blocking, locked edits and resets, exact-request recovery, authorization removal
after rejection, and subscriber behavior for rejected actions.
