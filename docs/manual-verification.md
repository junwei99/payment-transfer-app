# Manual verification

This project has no automated test suite; the [specification](user-story-spec.md)
chose manual verification at the customer boundary. A customer completes the flow
against the standalone API, device authentication runs through the real OS prompt,
and service failures come from the external developer controls described in
[the mock service README](../services/mock-api/README.md).

Run the checks below on both mobile targets, using those controls or a local
response-intercepting proxy. Static checks and production bundle exports passed for
iOS and Android on 2026-11-08. At the time of writing, no device journey or live API
scenario had been recorded against a signed build; the checklists below are the
acceptance matrix, and each run should be recorded with its OS, device, build, and
result.

## Transfer and recovery scenarios

- Load account and recipients; exercise loading, offline, empty recipients,
  individual read failures, manual entry when recipients fail, and Retry. Empty
  lists and malformed responses require interception; backend controls do not
  expose every response variation.
- Validate blank names, ten-digit accounts including leading zeros, invalid and
  excessive amounts, decimal precision, and notes over 200 characters. Review
  edits must appear in the eventual payment. Exceeding balance warns locally and
  yields the backend's insufficient-funds error.
- Configure each approval failure and confirm no submission occurs. Expire an
  approval (hold submission for over five minutes) and repeat authentication to
  obtain a fresh approval.
- Complete a transfer, compare receipt and lookup by ID, and verify the balance.
  Fail only the post-payment account read; the receipt must remain successful.
- Tap repeatedly and try Back/gestures while pending or uncertain. Editing and new
  transfers must remain blocked. Use `fail-once` for explicit same-key retry.
- Delay/drop the submission response after commit, then retry with normal
  responses. Inspect requests to confirm identical bodies and keys; expect one
  transfer and one debit. Intercept a malformed submission response and verify it
  also offers recovery instead of reporting a definitive failure.
- Background/foreground and disconnect/reconnect. Reads refresh when stale;
  payments must never submit automatically on reconnect.
- Open confirmation with an unseeded, unknown, or missing ID. Check lookup, errors,
  and Retry. Close/reopen the app to confirm that recovery is not persisted.

## Authentication acceptance checklist

Record the OS, device, biometric method, build, and result for each applicable case
on both Android and iOS:

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
  errors, and cooldown. Verify PIN data appears only in the verification request
  and never in logs or transfer submissions.

## Static checks

Run before declaring a task complete:

```sh
pnpm dlx prettier --write --ignore-unknown <modified-or-created-files>
pnpm exec expo lint
pnpm exec tsc --noEmit
```

Face ID requires a development build; Expo Go cannot verify that flow. The SDK 58
[LocalAuthentication documentation](https://docs.expo.dev/versions/v58.0.0/sdk/local-authentication/)
covers the native requirement. Static checks cannot establish that native
authentication or recovery scenarios passed.
