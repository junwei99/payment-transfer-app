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

Main challenge faced during this assessment is mainly due to unfamiliarity to the tech stack. It took some time for me to learn Zustand, React Hook Form and Tanstack Query.

Another challenge I faced is the time constraint, although the requirements look simple at first glance, the implementation took longer than expected due to all the negative flow handlings that comes with the feature.

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

Expose the service through a Cloudflare quick tunnel, from a second terminal:

```sh
cloudflared tunnel --url http://localhost:3001
```

Install `cloudflared` first with `brew install cloudflared` if it is missing.
The command prints a public `https://<random>.trycloudflare.com` URL. Put that
URL in `.env.local`:

```sh
EXPO_PUBLIC_API_URL=https://<random>.trycloudflare.com
```

Then, from the repository root in a third terminal, build and run the app:

```sh
pnpm exec expo run:ios --device     # or: pnpm exec expo run:android --device
```

The tunnel works from the simulator, the emulator, and a physical device, so the
same URL fits every target. It changes each time `cloudflared` starts: update
`.env.local` and restart Expo, because the value is inlined at build time. Anyone
with the URL can reach the mock service, so stop the tunnel when the demo ends.

The app throws a setup error when the variable is missing or invalid; there is no
fallback. Metro's tunnel does not forward the service. **Face ID needs a
development build, so Expo Go will not run that path.**

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
