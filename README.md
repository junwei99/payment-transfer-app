# Payment transfer assessment

An Expo SDK 58 app for iOS and Android backed by the standalone
[Bun mock API](services/mock-api/README.md). Account, recipients, and completed
transfers use TanStack Query. Approval and submission use mutations through the
existing Axios/Zod boundary. The backend owns the balance and transfer records.

## Run locally

1. Run `pnpm install` in the repository root.
2. Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_URL`.
   Use `http://localhost:3001` for the iOS simulator,
   `http://10.0.2.2:3001` for the standard Android emulator, or
   `http://<your-Mac-LAN-IP>:3001` for a physical device on the same network.
   There is no fallback URL; invalid or missing configuration throws a setup error.
3. In `services/mock-api`, run `bun install --frozen-lockfile`, then `bun run dev`.
   The service binds to `0.0.0.0` by default. Metro tunnels do not forward this API.
4. Run `pnpm exec expo start` in the root and open the app on iOS or Android.

Expo inlines public environment variables; reload after changing the URL. Never
put secrets in `EXPO_PUBLIC_` variables. The added `expo-network` and `expo-crypto`
modules use SDK-compatible versions and are included in Expo Go. Existing
custom development builds need rebuilding to include newly added native modules.
See the SDK 58 [Network](https://docs.expo.dev/versions/v58.0.0/sdk/network/)
and [Crypto](https://docs.expo.dev/versions/v58.0.0/sdk/crypto/) documentation.

## Transfer behavior and limitations

Enter recipient details (a ten-digit account number), a positive amount with at
most two decimal places, and an optional note of at most 200 characters. Leading
zeros in account numbers are preserved. Amounts are converted exactly into safe
integer minor units. The backend makes the final available-balance decision.

The authentication screen has one **Simulate authentication** action. It requests
approval for the reviewed details and then submits the payment. Real device
biometrics and passcode fallback remain deferred assessment requirements. No real
money moves.

Payment mutations never automatically retry or queue for reconnect. An uncertain
submission locks editing and new transfers and offers **Retry transfer**, using
the identical request, approval ID, and idempotency key. Retry can complete a
payment that never reached the backend. A completed request replays its original
receipt without a second deduction, even after approval expiry. Unknown errors,
malformed responses, and transport failures are treated conservatively.

Recovery exists only in memory while the app remains open. Closing or reloading
the app loses unresolved-submission recovery information. There is no secure
storage, persisted Query cache, restart recovery, or transfer history. A fresh
balance cannot establish that a particular transfer succeeded. Restarting or
resetting the mock backend also discards its receipts and idempotency records;
do not do this during an unresolved payment.

On success, the app caches the validated receipt by ID and refreshes the balance
without delaying confirmation. A balance-refresh error never turns a completed
payment into a failed payment. Confirmation also supports lookup with
`/confirmation?id=<transfer-id>`. Done clears only the local form.

Stale active reads refresh on foreground and reconnect. Account data is stale
immediately; recipients stay fresh for five minutes. Transient reads retry once.
Previously loaded data remains visible after a failed refresh. These integrations
follow the official [TanStack Query React Native guide](https://tanstack.com/query/latest/docs/framework/react/react-native).

## API boundary

All calls use POST JSON bodies. Banking services live in
`src/services/index.services.ts`; endpoint schemas are in `src/schemas/apis/` and
the registry and inferred types in `src/schemas/api.schema.ts`.
`src/utils/requestor.utils.ts` sends bodies unchanged, parses responses with Zod,
and returns discriminated success, API, parse, or transport results. The Query
adapter throws failures instead of caching them as successful data.

The requestor timeout is 30 seconds and it never retries. Health and developer
control endpoints are for external development tools only; the mobile client
does not call them. Use the service README's curl commands to configure scenarios.

## Manual verification

No automated tests or test framework were added. Run these checks on both mobile
targets, using external mock controls or a local response-intercepting proxy:

- Load account and recipients; exercise loading, offline, empty recipients,
  individual read failures, manual entry when recipients fail, and Retry.
  Empty lists and malformed responses require interception; backend controls do
  not expose every response variation.
- Validate blank names, ten-digit accounts including leading zeros, invalid and
  excessive amounts, decimal precision, and notes over 200 characters. Review
  edits must appear in the eventual payment. Exceeding balance warns locally and
  yields the backend's insufficient-funds error.
- Configure each approval failure and confirm no submission occurs. Expire an
  approval (hold submission for over five minutes) and repeat simulated
  authentication to obtain a fresh approval.
- Complete a transfer, compare receipt and lookup by ID, and verify the balance.
  Fail only the post-payment account read; the receipt must remain successful.
- Tap repeatedly and try Back/gestures while pending or uncertain. Editing and
  new transfers must remain blocked. Use `fail-once` for explicit same-key retry.
- Delay/drop the submission response after commit, then retry with normal
  responses. Inspect requests to confirm identical bodies and keys; expect one
  transfer and one debit. Intercept a malformed submission response and verify
  it also offers recovery instead of reporting a definitive failure.
- Background/foreground and disconnect/reconnect. Reads refresh when stale;
  payments must never submit automatically on reconnect.
- Open confirmation with an unseeded, unknown, or missing ID. Check lookup,
  errors, and Retry. Close/reopen the app to confirm that recovery is not persisted.

Required static checks:

```sh
pnpm dlx prettier --write --ignore-unknown <modified-or-created-files>
pnpm exec expo lint
pnpm exec tsc --noEmit
```

Verification on 2026-11-08: formatting, Expo lint, TypeScript, and production
bundle exports for iOS and Android passed. Device journeys and live API scenarios
were not exercised; the scenarios above remain a manual acceptance checklist.
