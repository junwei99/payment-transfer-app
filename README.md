# payment-transfer-app

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
4. Build and install a native app using `pnpm exec expo run:ios --device` or
   `pnpm exec expo run:android --device`. Local iOS builds require macOS, Xcode,
   and signing for a physical device; Android builds require the Android SDK and
   a connected device with USB debugging enabled. Expo generates native projects
   from app configuration. Rebuild after changing native dependencies or permissions.
5. For later JavaScript-only changes, run `pnpm exec expo start` and reconnect
   the installed app to Metro.

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

Confirm transfer starts real device biometrics. Android requires strong (Class 3)
biometrics. Choose **Use banking PIN** on review to skip the prompt, or select it
from authentication recovery. On iOS, the native fallback action also opens PIN
entry. Cancel returns to review without sending. Devices without usable biometrics
or a screen lock can use the banking PIN directly.

The demo PIN is **111111**. The mock backend verifies this fixed demo
credential; it is not the phone's passcode or production security. Enter six digits
and tap **Confirm transfer**. `POST /transfer-authorizations` receives the reviewed
details and `authentication`: either `{ "method": "pin", "pin": "111111" }` or,
after successful native authentication, `{ "method": "biometric", "success": true }`.
The backend verifies the PIN and issues approval in the same request. The PIN never
enters transfer state, Query mutation variables, logs, or transfer submission payloads.
The biometric result is a client-declared mock result, not cryptographic proof.

Five wrong entries trigger a server-enforced 30-second PIN-only cooldown shared
by the demo account across devices. Counts survive navigation and app restarts;
successful PIN verification or cooldown expiry clears failures. Backend reset or
restart clears all demo state. Biometrics retain OS-managed limits and remain
available during PIN cooldown. There is no enrollment or recovery.

Leaving the app during authentication abandons the attempt and preserves transfer
details; returning requires fresh authentication. The native prompt's inactive
state alone does not cancel authentication. Once submission starts, existing
uncertain-submission recovery applies. No real money moves, and the mock backend
does not verify biometric proof.

Face ID requires a native development build; Expo Go cannot verify this flow.
The LocalAuthentication config plugin supplies the Face ID permission description.
See [Expo SDK 58 LocalAuthentication](https://docs.expo.dev/versions/v58.0.0/sdk/local-authentication/).

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
and returns validated success data directly. Expected API, parse, and transport
failures throw the shared `ServiceError` from `src/utils/service-error.utils.ts`.
Its `failure` retains the category, HTTP status where available, parsed API details
(including PIN cooldown), validation issues, or transport reason. Unexpected
programming and configuration errors propagate unchanged. Callers do not unwrap
results; Query receives rejected promises for failures.

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
  approval (hold submission for over five minutes) and repeat
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

### Authentication acceptance checklist

Physical-device verification is assigned to the user and remains pending. Record
OS/device, biometric method, build, and result for each applicable case on both
Android and iOS:

- Real biometric success sends exactly once; native Cancel returns to review with
  details intact and no approval/submission calls.
- Explicit banking PIN choice before biometric failure; valid `111111`; short,
  nondigit, and incorrect input; masked entry and cleared input on failure/exit.
- Fifth wrong PIN triggers 30 seconds of waiting. Back/re-entry preserves attempts
  and remaining time. Expiry and successful PIN verification reset counts.
  Biometrics work during PIN cooldown; app restart does not reset server protection.
- No hardware/enrollment, biometric lockout, Android weaker-only biometrics, and
  denied iOS Face ID permission offer usable PIN recovery. No device credential
  prompt should appear. No device screen lock is required for demo PIN use.
- Biometric failure/timeout/interruption offers explicit recovery. Genuine
  backgrounding abandons PIN or biometric authentication; the native prompt itself
  does not. Late success after abandonment must never call approval.
- Rapid confirmation/retry taps, native Back, gestures, editing reviewed details,
  fresh authentication after approval failure, and expired approval.
- Uncertain submission retry retains the original body/key, without fresh
  authentication, and yields only one debit. Do not reset the mock backend here.
- Keyboard, small screen, larger text, and screen reader access to PIN controls,
  errors, and cooldown. Verify PIN data appears only in the verification request and never in logs or transfer submissions.

Required static checks:

```sh
pnpm dlx prettier --write --ignore-unknown <modified-or-created-files>
pnpm exec expo lint
pnpm exec tsc --noEmit
```

Verification on 2026-11-08: formatting, Expo lint, TypeScript, and production
bundle exports for iOS and Android passed. Device journeys and live API scenarios
were not exercised; the scenarios above remain a manual acceptance checklist.
