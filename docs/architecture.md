# Transfer module architecture

How a transfer moves through the app, which layer owns each decision, and how the
module behaves when a request does not come back. This document expands the
summary in the [README](../README.md); the product behaviour it implements is the
[user story specification](user-story-spec.md).

## Request path

```
route (src/app) → screen → hook → store dispatch → Query → service → requestor
```

- Routes render one screen and redirect away when the journey is locked.
- Hooks perform side effects — challenge, approval, submission, field binding — and
  never write journey state directly.
- The store accepts a typed action or rejects it. Nothing else mutates a journey.
- Query owns server data and the retry and staleness policy.
- Services declare endpoint calls; the requestor is the only code that speaks HTTP
  and parses responses.

## Journey state

All transitions pass through `dispatch` in
[`src/stores/transfer.ts`](../src/stores/transfer.ts), backed by the pure
`transitionJourney(journey, action)` function. It returns the next journey for an
accepted action and `null` for a rejected one. Dispatch saves an accepted journey
and returns a boolean; callers must stop dependent side effects after a rejection,
including API calls and form resets. The full action table is in
[the dispatch design note](design/transfer-dispatch.md).

Edit-related actions check the synchronous transfer lock. Approval and submission
actions check their allowed source states — the lock must not prevent a pending
operation from settling or an unresolved submission from retrying.

The writable store stays private. Consumers get selector-based React access,
imperative reads, subscriptions, and dispatch.

## Device authentication

Approve a transfer, not the app. There is no login, enrollment, or remembered
authentication.

### Biometric path

`src/services/authentication.ts` requires enrolled hardware at
`BIOMETRIC_STRONG` (Android Class 3) and calls `authenticateAsync` with
`disableDeviceFallback: true`, so the operating system's passcode prompt never
appears inside the banking flow. The app's own PIN surface is the only fallback.

Success returns a client-declared result. The mock service does not verify
cryptographic biometric proof, and the copy must not imply that it does.

### PIN fallback

The banking PIN is a separate app surface, chosen explicitly from review or from
authentication recovery; cancellation returns to review with details intact rather
than opening PIN entry automatically. Entry is masked, accepts six digits, requires
an explicit **Confirm transfer** action, and clears on exit and after a failure.

Devices without usable biometrics or without a screen lock can use the bank PIN
directly. The demo PIN is `111111`.

`POST /transfer-authorizations` receives the reviewed details and
`authentication`: either `{ "method": "pin", "pin": "111111" }` or, after
successful native authentication, `{ "method": "biometric", "success": true }`. The
backend verifies the PIN and issues approval in the same request. Approval binds
the normalized recipient, amount, currency, and note, and expires after five
minutes; the returned expiry is authoritative.

Five wrong entries trigger a server-enforced 30-second PIN-only cooldown shared by
the demo account across devices. Failed counts survive navigation and app restarts.
Successful verification or cooldown expiry clears them; backend reset or restart
clears all demo state. Biometrics keep their OS-managed limits and remain available
during PIN cooldown.

The PIN never enters transfer state, Query mutation variables, logs, or transfer
submission payloads.

### Leaving the app

Leaving the app during authentication abandons the attempt and preserves the
transfer details; returning requires fresh authentication. The native prompt's
inactive state alone does not cancel authentication. Once submission starts, the
recovery behaviour below applies instead.

## Submission lifecycle

| State                                 | Behaviour                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Ready for review or authentication    | Correction and cancellation allowed; nothing is sent                                                        |
| Authenticating or requesting approval | Progress shown; duplicate actions blocked; no submission without successful prerequisites                   |
| Submitting                            | Progress shown; Back, editing, and new transfers blocked                                                    |
| Outcome unknown                       | Uncertainty explained; original request retained; explicit retry offered; editing and new transfers blocked |
| Definitively rejected                 | Reason explained; draft retained for correction; no completed receipt shown                                 |
| Completed                             | Backend-confirmed receipt shown; account data refreshed independently                                       |

Each new submission gets its own idempotency key. While unresolved, the exact body
— transfer details, approval ID, and key — is retained. Recovery replays that
identical body and key, never a replacement approval or a fresh key. The service
returns the original completed transfer for an identical successful replay, even
after the approval was consumed or expired, and a changed body under a completed
key returns `409`.

Classification comes from the validated error contract, not the HTTP status alone:
transport failures, timeouts, 5xx, and malformed bodies are unknown outcomes;
insufficient funds and the documented definitive rejections preserve the draft.
An HTTP failure by itself is never enough to declare a payment failed.

Neither approval nor submission retries automatically, and offline state never
queues a payment. `expo-network` drives Query's online manager and `AppState`
drives its focus manager, so stale reads refresh on reconnect and return; the
submission mutation itself uses `retry: false` and `networkMode: "always"` so a
paused mutation cannot resume by itself on reconnect.

Recovery exists only in memory while the app remains open. Closing or reloading the
app loses unresolved-submission information: there is no secure storage, persisted
Query cache, restart recovery, or transfer history. A fresh balance cannot
establish that a particular transfer succeeded. Restarting or resetting the mock
service also discards its receipts and idempotency records, so it must not happen
during an unresolved payment.

## Confirmation

On success the app caches the validated receipt by ID and refreshes the balance
without delaying confirmation. A balance-refresh error never turns a completed
payment into a failed one. Confirmation is identified by transfer ID and supports
lookup with `/confirmation?id=<transfer-id>`; missing and unknown IDs have usable
states that never invent receipt values. Making another transfer clears only the
local form.

## Server data and refresh policy

- Account data is stale immediately; recipients stay fresh for five minutes.
- Stale active reads refresh on foreground and reconnection; no polling.
- Transient reads retry once. Invalid responses and definitive rejections do not
  retry; manual retry is offered after a failed initial read, and failed background
  refreshes are reported.
- Previously loaded data stays visible after a failed refresh, identified as last
  known rather than current.
- Refreshing never overwrites the draft or resets a transfer in progress.

This wiring follows the official
[TanStack Query React Native guide](https://tanstack.com/query/latest/docs/framework/react/react-native).

## Input contract

Enter a ten-digit account number, a positive amount with at most two decimal
places, and an optional note of at most 200 characters. Leading zeros in account
numbers are preserved as text. Amounts convert exactly into safe-integer minor
units; invalid precision is rejected rather than rounded. The backend makes the
final available-balance decision, because a cached balance can be stale.

## API boundary

All calls use POST with JSON bodies ([ADR 0001](adr/0001-post-only-body-api.md)).
Banking services live in `src/services/index.services.ts`; endpoint schemas are in
`src/schemas/apis/`, with the registry and inferred types in
`src/schemas/api.schema.ts`.

`src/utils/requestor.utils.ts` sends bodies unchanged, parses responses with Zod,
and returns validated success data directly. Expected API, parse, and transport
failures throw the shared `ServiceError` from
`src/utils/service-error.utils.ts`. Its `failure` retains the category, HTTP status
where available, parsed API details (including PIN cooldown), validation issues, or
transport reason. Unexpected programming and configuration errors propagate
unchanged. Callers do not unwrap results; Query receives rejected promises for
failures.

The requestor timeout is 30 seconds and it never retries. Health and developer
control endpoints exist for external development tools only; the mobile client does
not call them. Use the service README's curl commands to configure scenarios.
