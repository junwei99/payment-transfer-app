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

- Form library that works with Zod to validate form against with schema.

#### TanStack Query

- Manages server side data.

- Caching and query invalidation keep the UI up to data after API writes.

#### Zustand

- Manages client side data.

- A more performative alternative to React Context as Context re-renders every component that reads it, on any change.

- Zustand keeps re-renders local. Each screen subscribes to the part it shows

## Design decisions

| Decision                                                               | Why                                                                                    | Cost                                                       |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Every endpoint is POST with a JSON body, reads included                | One requestor contract, with no path, query, or header variants to keep in sync        | Reads look unconventional to a REST reviewer               |
| React Hook Form owns form values, the store owns journey state         | One source of validation in Zod, and a draft that survives navigation                  | Form state is not readable outside the form                |
| Transitions go through a typed dispatch over a pure function           | An illegal transition cannot be written, and a rejected action cannot leak an API call | Each action needs an allowed source state                  |
| No automatic retry and no offline queue for payments                   | A retried payment can debit twice                                                      | The user has to act                                        |
| A submission's outcome is classified from the validated error contract | A timeout or a 5xx is unknown, which is different from a rejection                     | Depends on the service keeping a documented error taxonomy |

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

## Documentation

| Document                                           | Covers                                                        |
| -------------------------------------------------- | ------------------------------------------------------------- |
| [Architecture](docs/architecture.md)               | Request path, journey state machine, and error contract       |
| [User story spec](docs/user-story-spec.md)         | Product behaviour and acceptance criteria                     |
| [Manual verification](docs/manual-verification.md) | Scenario checklist for transfer, recovery, and authentication |
| [Technology choices](docs/tech-choices.md)         | Framework, library, and tooling rationale                     |
| [Design guides](docs/design/styling-guide.md)      | Styling, loading states, form validation, and dispatch        |
| [ADRs](docs/adr)                                   | Post-only API and the category-folder layout                  |
| [Assessment brief](docs/requirements.md)           | The original take-home brief                                  |

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
