# TanStack Query execution plan

Status: ready-for-human

Read [the agreed spec](spec.md), AGENTS.md, and docs/tech-choices.md first.
Preserve unrelated staged and working changes. The implementation below is complete. Manual device acceptance remains pending;
see the verification record at the end of this document.

## 1. Query foundation

Add TanStack Query with pnpm and update the lockfile. Add a stable QueryClient
provider in src/app/_layout.tsx. Keep reusable hooks, query keys, options, and
adapters outside src/app/. Use @/ local imports throughout.

Retain src/services/index.services.ts, the Axios requestor, Zod response parsing,
existing POST JSON contracts, and required EXPO_PUBLIC_API_URL without a fallback.
Do not add client calls to backend health or developer-control endpoints.

The requestor returns discriminated success, api-error, parse-error, and
transport-error results. Add a small adapter that returns validated success data
or throws a meaningful error retaining the failure category and API details.
Do not put failed response wrappers into the success cache. Keep requestor retries
disabled; query-level read retries are configured separately.

Consult official TanStack documentation during implementation:

- [Query functions and errors](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions)
- [React Native lifecycle and connectivity](https://tanstack.com/query/latest/docs/framework/react/react-native)

Expo is currently ~58.0.23. Recheck package.json and consult the matching
https://docs.expo.dev/versions/v58.0.0/ documentation before changing Expo or React
Native APIs. Choose a compatible connectivity integration for reconnect refresh;
account for any native dependency's development-build requirements.

## 2. Account and recipient reads

Add account and recipient queries with stable keys. Account staleTime is zero;
recipient staleTime is five minutes. Staleness does not imply polling.

Connect foreground and network status to Query's focus/online managers, with
listener cleanup. Refresh stale active reads on foreground and reconnect.
Retry transient read errors once; do not retry validation or definitive API
rejections automatically. Provide manual Retry after initial loading failure.

Keep previously fetched data visible during background refresh and show refresh
errors. Do not substitute fixtures or invented balances. Handle empty recipients.
If account data has never loaded, block proceeding. If only recipients fail,
show their retry control and allow valid manual recipient entry.

## 3. Form and review

Remove example-value substitution and scripted validation. Require valid recipient
details, including the API's ten-digit account number. Preserve leading zeros.
Require a positive amount with at most two decimal places, convert it safely to
integer minor units, and respect the API's safe-integer limits. Limit notes to
200 characters and follow existing schema normalization rules.

Display cached balance and warn when the entered amount exceeds it. Let the
backend make the final insufficient-funds decision.

Keep draft fields, validation messages, reviewed details, and authentication UI
state local. Editing reviewed details invalidates previous approval. Do not cache
authentication results. An approval applies to the exact reviewed transfer.

## 4. Approval, submission, and recovery

Replace scripted biometric/passcode outcomes with one clearly labelled
"Simulate authentication" action. It calls the approval API and then submission.
Approval failure must not proceed to submission. Expired approval requires
repeating the simulated authentication/approval step for a fresh attempt.

Use mutations for these operations. Disable automatic retries and ensure offline
requests are not silently queued to submit on reconnect. The user must explicitly
initiate submission or recovery.

Prevent repeated taps throughout approval/submission. Once submitting, block
Back, editing, and starting another transfer until the result is resolved.
Preserve a snapshot of the exact submitted body, approval ID, and idempotency key
in flow-level memory. Do not clear it on screen blur or navigation cleanup.

Distinguish a definitive rejection from an uncertain outcome. Timeout,
cancellation, connection loss, or an invalid submission response cannot establish
that no transfer occurred. Preserve the snapshot for these cases and show:
"We couldn't confirm whether this transfer completed."

Offer an explicit "Retry transfer" action using the identical saved body and key.
Do not request a new approval or generate a new key for an uncertain attempt.
Explain that retry can complete the payment if the original request never arrived.
The existing backend supports idempotent replay; it has no lookup by idempotency
key. Review its actual error contract before classifying any failure as safe to
clear. Do not treat every thrown error or HTTP failure as a definitive rejection.

After confirmed success or definitive rejection, release the unresolved attempt
appropriately. A fresh edited attempt requires fresh approval and its own key.
No recovery information is persisted across app closure.

## 5. Confirmation and balance refresh

Seed a transfer-by-ID cache entry from the validated submission response and
navigate to confirmation with that ID. Confirmation must also fetch by ID when
opened without a seeded entry, with loading, error, missing-ID, and retry handling.

Refresh/invalidate account data after confirmed success. Show the receipt without
waiting for balance refresh. A failed balance refresh must never turn a successful
payment into a failed payment or invite resubmission. Never optimistically deduct
funds or infer a transfer's success from the balance alone.

## 6. Remove legacy client mock handling

Migrate callers, then delete src/transfer/mock-transfer.ts. Review these files for
obsolete gateway types, fixtures, scenarios, cancellation behaviour, and copy:

- src/transfer/transfer-context.tsx
- src/transfer/types.ts
- src/transfer/components.tsx
- src/app/index.tsx
- src/app/review.tsx
- src/app/authenticate.tsx
- src/app/confirmation.tsx

Remove scenario controls, example-value notices, Reset demo, fixed receipts, and
scripted passcode outcomes. Local form reset must never reset server state.
Retain accurate wording that this is a simulated backend and authentication step.
Preserve the existing UI design and Expo Router navigation.

Update the README with setup changes, manual verification instructions, deferred
biometrics, and the loss of unresolved recovery information when the app closes.
Use backend developer controls externally to exercise scenarios.

## 7. Developer verification

Do not add automated tests or a test framework. Manually verify on the supported
mobile targets and record what was actually exercised:

- Account/recipient initial loading, empty recipients, partial failures, manual
  entry when recipients fail, and retry.
- Valid and invalid recipient/amount/note input; leading zeros; insufficient funds.
- Review edits, approval failures and expiry, and no submission after failed approval.
- Successful payment, correct receipt, lookup by ID, and refreshed balance.
- Successful payment with failed balance refresh still shows a successful receipt.
- Repeated taps create only one attempt; Back/edit/new transfer remain blocked
  during submission and uncertain outcomes.
- A delayed/lost submission response followed by explicit same-key retry creates
  only one completed transfer and deducts the balance once.
- Malformed submission response does not incorrectly report a definitive failure.
- Foreground/reconnect refreshes reads without automatically submitting payments.
- App closure loses in-memory recovery as documented; no claim of restart recovery.
- No client mock fallback, scenario controls, or example input substitution remains.

Run required checks before declaring implementation complete:

```sh
pnpm dlx prettier --write --ignore-unknown <all-modified-or-created-files>
pnpm exec expo lint
pnpm exec tsc --noEmit
```

Report manual verification separately from static checks. Do not claim device or
runtime scenarios passed if they were not exercised.

## Implementation verification — 2026-11-08

Implemented the Query provider, service-error adapter, account/recipient/receipt
reads, approval/submission mutations, local input validation, and same-body/key
recovery. Removed the client mock gateway and scenario controls. Updated the
root and service READMEs. Existing staged work was preserved.

Passed Prettier, `pnpm exec expo lint`, and `pnpm exec tsc --noEmit`. Expo
production exports for iOS and Android also completed successfully, using
`EXPO_PUBLIC_API_URL=http://localhost:3001` and output outside the repository.
No automated tests or test framework were added.

No device journeys or live API scenarios were exercised in this session. The
sandbox could not connect to CoreSimulator. The mobile acceptance checklist in
section 7 and the README remains pending, including navigation gestures, network
lifecycle behavior, and uncertain-submission recovery.
