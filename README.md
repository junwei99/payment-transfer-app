# Payment transfer with biometrics

An Expo app for iOS and Android that sends money to a recipient and approves the
transfer with the device's biometrics, falling back to a banking PIN that the
backend verifies. A standalone Bun service owns the balance, approvals, and
completed transfers.

Most of the work went into one failure case: a payment whose response never
arrives can still have gone through, so the app must not report it as failed and
must not send it twice.

**Stack:** Expo SDK 58, React Native 0.88, React 19, TypeScript 6, Expo Router,
TanStack Query, Zustand, React Hook Form, Zod, Uniwind.

## Demo

<!-- Record 60 to 90 seconds against a development build, then replace this section
     with: [![Watch the demo](docs/demo-poster.png)](docs/demo.mp4)
     Suggested capture: invalid input, manual recipient, review, Face ID prompt,
     receipt, and a fail-once retry that debits only once. -->

Recording pending. The walkthrough covers invalid input, manual recipient entry,
review, the biometric prompt, the receipt, and a failed submission retried with
the identical request.

## Features

- **Recipients:** pick a saved recipient with search by name or account number,
  or enter a name and account number manually
- **Amount:** enter an amount in MYR with an optional note
- **Balance:** see the available balance, refreshed when the app returns to the
  foreground or reconnects
- **Approval:** approve with Face ID, Touch ID, or fingerprint
- **PIN fallback:** fall back to a six-digit banking PIN, with the attempt limit
  and 30-second cooldown enforced by the service across devices
- **Bound approval:** approval binds to the reviewed recipient, amount,
  currency, and note, and expires after five minutes
- **Recovery:** recover an unconfirmed transfer by resending the identical
  request, then open the receipt by transfer ID
- **Fit and finish:** the recipient list is virtualized and searchable, and
  screen motion follows the system reduce-motion setting

## Technology choices

#### Uniwind with Tailwind CSS 4

- makes styling with Tailwind possible on React Native.

#### Zod

- Validates form input and API responses.

- Types inferred from schemas keep runtime validation and static types in sync.
- Requestor + Zod schema system so that all API responses are required to be provided a Zod schema to ensure runtime accurate API response types.

#### React Hook Form

- Form library that works with Zod to validate form against schema.

#### TanStack Query

- Manages server side data.
- Caching and query invalidation keep the UI up to data after API writes.

#### Zustand

- Manages client side data.
- A more performative alternative to React Context as Context re-renders every component that reads it, on any change.
- Zustand keeps re-renders local. Each screen subscribes to the part it shows

## Technical design decisions

#### A payment executes at most once

- An approval is bound to the reviewed details and consumed on success. An
  idempotency key identifies the submission. Replaying the same key and body
  returns the original receipt.
- Nothing retries on its own. A timeout, dropped connection, 5xx, or unreadable
  body is an unknown outcome, so the app keeps the exact request and offers one
  retry.
- Changing the payment creates a new approval and a new key, so one key covers
  one payment.

| Request arriving at the service | Result                                |
| ------------------------------- | ------------------------------------- |
| Known key, identical body       | The original receipt, `200`, no debit |
| Known key, different body       | `409`, no debit                       |
| Unknown key, valid approval     | One debit, `201`                      |

#### One dispatch owns every journey change

- `dispatch` is the only writer. It calls the pure `transitionJourney` switch and
  stores the accepted result. A missing case fails `tsc`.
- It returns `false` when an action is not allowed and leaves state unchanged.
  Callers check the result before sending a request or resetting the form.
- Actions describe intent. The store derives the next state: retry reuses the
  stored submission, and rejection rebuilds an editable draft without the
  approval ID or key.

```ts
// src/stores/transfer.ts
dispatch: (action) => {
  const next = transitionJourney(get().journey, action);

  if (next === null) {
    return false; // blocked, state unchanged
  }

  set({ journey: next });
  return true;
},
```

```ts
// src/hooks/useSubmitTransfer.ts
if (!dispatch({ type: "START_APPROVAL", attemptId })) {
  return; // no approval request
}
```

#### One registry defines every API contract

- Each endpoint has one entry with request, success, and error schemas. The
  requestor only accepts registered paths.
- Types come from those schemas, and the same schemas validate responses at
  runtime, so drift becomes a parse error.
- The requestor parses non-2xx bodies and throws a typed `ServiceError`. Callers
  read `code`, `message`, and `retryAt` without casting.

```ts
// src/schemas/apis/submit-transfer.schema.ts
export const SUBMIT_TRANSFER_API_SCHEMA = {
  request: SUBMIT_TRANSFER_REQ_SCHEMA,
  successResponse: SUBMIT_TRANSFER_RES_SCHEMA,
  errResponse: SUBMIT_TRANSFER_ERR_RESPONSE_SCHEMA,
};

// src/schemas/api.schema.ts
export const API_SCHEMA = {
  "/transfers": SUBMIT_TRANSFER_API_SCHEMA,
  "/transfers/lookup": GET_TRANSFER_API_SCHEMA,
} as const;
```

## Business requirements decisions

#### A lost response is not a failure

- The app cannot tell whether the money moved, so it marks the result unknown
  and keeps the exact request. Edits and new transfers stay blocked until the
  customer chooses retry.
- Nothing retries automatically, including on reconnect. Retry sends the same
  request, so the bank can return the original receipt instead of debiting twice.

#### Every payment needs a new approval

- A biometric prompt or the bank PIN approves one reviewed transfer. Changing
  the recipient, amount, currency, or note, or letting the five-minute approval
  expire, requires authenticating again.
- The phone's passcode is not accepted. The service counts wrong PIN attempts,
  so five wrong entries trigger a 30-second cooldown across devices.

#### The bank decides success and balance

- A transfer is complete only when the bank returns a valid receipt. A failed
  balance refresh is shown separately and does not undo the receipt.
- The app can warn about a low balance, but the bank checks the real balance at
  submission. It never invents a balance or shows success early.

## Challenges

Approval and submission are separate requests, so a lost submission response
leaves the app unable to tell whether money moved. Every submission resolves to
one of three outcomes:

| Outcome    | How it is decided                                             | What the app keeps                                                                                                            |
| ---------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Completed  | The response validates as a receipt                           | The receipt, cached by transfer ID. The balance refreshes separately, so a later read failure cannot mark it failed           |
| Rejected   | A validated error from the service's taxonomy                 | The draft, with no debit                                                                                                      |
| Unresolved | A timeout, a dropped connection, a 5xx, or an unparsable body | The exact body, approval ID, and idempotency key. Editing and new transfers stay blocked, and retry replays that same request |

The service returns the original receipt for an identical replay, even after the
approval expired.

Two details here were easy to get wrong:

- The mutation runs with `retry: false` and `networkMode: "always"`. TanStack
  Query would otherwise pause a mutation while offline and fire it on reconnect,
  which is the app submitting money on the user's behalf.
- A changed balance is never treated as proof that a specific transfer completed.

Face ID only runs in a development build, so the native prompt is configured
through the `expo-local-authentication` config plugin rather than Expo Go. On
Android the check requires Class 3 biometrics, and `disableDeviceFallback` keeps
the system passcode prompt out of the flow, since a transfer approved with the
phone's unlock code is not what the brief asks for. The PIN is its own screen,
reached from review or from authentication recovery. Attempt counts live on the
service so five wrong entries trigger a cooldown shared across devices, which a
client-side counter could not enforce.

Separating editable values from journey state was the other constraint. React Hook
Form stays the only owner of editable values, and the store accepts transitions,
so editing reviewed details invalidates the approval in one place. The form
provider sits above the navigation stack, which is why Back and forward keep the
draft without persisting anything.

## Run it

Install the dependencies and copy the environment file:

```sh
pnpm install
cp .env.example .env.local        # set EXPO_PUBLIC_API_URL
```

Start the service:

```sh
cd services/mock-api
bun install --frozen-lockfile
bun run dev
```

Then, from the repository root in a second terminal, build and run the app:

```sh
pnpm exec expo run:ios --device     # or: pnpm exec expo run:android --device
```

| Target           | `EXPO_PUBLIC_API_URL`      |
| ---------------- | -------------------------- |
| iOS simulator    | `http://localhost:3001`    |
| Android emulator | `http://10.0.2.2:3001`     |
| Physical device  | `http://<Mac-LAN-IP>:3001` |

The app throws a setup error when the variable is missing or invalid; there is no
fallback. The service binds to `0.0.0.0`, and Metro tunnels do not forward it.
Face ID needs a development build, so Expo Go will not run that path.

## Project map

```text
src/
  app/          Expo Router routes, one file per screen
  screens/      screen composition and per-screen components
  components/   shared layout, transfer, and ui pieces
  hooks/        side effects: challenge, approval, submission, PIN cooldown
  stores/       journey state and PIN attempt state
  query/        Query client and server data
  services/     endpoint declarations behind the requestor
  schemas/      Zod schemas for forms and API contracts
  types/        shared types
  utils/        requestor, error mapping, and formatting helpers
services/
  mock-api/     Bun service: balance, approvals, idempotent transfers
docs/           architecture, design guides, and decisions
```

## Assumptions

- macOS with Xcode for iOS, the Android SDK and USB debugging for Android, and
  Bun 1.2.11 or later for the service
- One MYR account and no sign-in. Changing `.env.local` needs a reload because
  Expo inlines the value at build time
- The demo PIN is `111111`. It is a fixed credential the service verifies, not
  the device passcode
- No real money moves; the service simulates payments

## Known limits

- Recovery lasts only while the app is open. There is no persisted draft, cache,
  or restart recovery
- No transfer history. Receipts are looked up by transfer ID
- The service does not verify biometric proof; the app declares the result
- Contact import and recent-transfer history were the optional stretch goals and
  are not implemented
- No automated tests. Formatting, lint, and type checks pass
