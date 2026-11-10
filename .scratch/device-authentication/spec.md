# Real biometrics with demo banking PIN

Status: ready-for-human

## Problem Statement

The current transfer flow uses a simulated-authentication button. Customers need
real biometric authorization on Android and iOS and a usable banking PIN fallback
when biometrics cannot be used. The app needs demonstrable frontend
behavior without claiming production identity verification.

## Solution

Confirming a reviewed transfer starts real device biometrics when available.
Customers can explicitly choose a backend-verified demo banking PIN, `111111`, without
first failing biometrics. Successful authentication immediately requests transfer
approval and submits the reviewed transfer. Cancellation preserves the draft and
returns to review. The user will verify native behavior on physical devices.

## User Stories

1. As a customer, I want confirmation to start authentication, so that authorization is tied to my reviewed transfer.
2. As an iOS customer, I want supported Face ID or Touch ID authentication, so that I can approve using device biometrics.
3. As an Android customer, I want strong device biometric authentication, so that I can approve using supported device security.
4. As a customer, I want an explicit banking PIN alternative, so that I need not fail biometrics first.
5. As a customer without enrolled biometrics, I want PIN entry directly, so that I can complete a transfer.
6. As a customer without a screen lock, I want the demo banking PIN available, so that the app remains usable.
7. As a customer with locked-out biometrics, I want banking PIN entry, so that biometric lockout does not block that alternative.
8. As a customer, I want masked six-digit numeric PIN entry, so that my entry is not displayed in plain text.
9. As a customer, I want an explicit confirmation button enabled after six digits, so that typing alone cannot submit.
10. As a customer, I want incorrect PIN feedback and cleared input, so that I can retry deliberately.
11. As a customer, I want five incorrect PIN attempts to trigger a 30-second cooldown, so that repeated guesses are limited by the backend.
12. As a customer, I want navigation to preserve attempt counts and cooldown, so that returning to the screen does not reset them.
13. As a customer, I want biometrics available during PIN cooldown, so that the independent method remains usable.
14. As a customer, I want cancellation to return to review, so that I can reconsider without sending money.
15. As a customer, I want biometric errors to offer explicit recovery choices, so that I control how to proceed.
16. As a customer, I want leaving the app to abandon authentication, so that returning requires a fresh attempt.
17. As a customer, I want the native prompt itself to remain valid, so that system UI does not falsely cancel my attempt.
18. As a customer, I want successful authentication to submit immediately, so that no redundant confirmation is required.
19. As a customer, I want duplicate actions blocked, so that one authorization cannot create multiple transfers.
20. As a customer, I want changed details or a failed approval to require fresh authentication, so that stale authorization cannot be reused.
21. As a customer, I want uncertain submission recovery to retain its original request, so that retry cannot duplicate payment.
22. As a customer, I want entered PIN data cleared on exit, so that it is not retained unnecessarily.
23. As a developer, I want setup instructions and the demo PIN documented, so that I can verify both platforms.
24. As a developer, I want limitations stated clearly, so that the fixed PIN is not presented as production security.

## Implementation Decisions

- Replace simulated authentication in the existing review/authentication journey;
  retain Expo Router navigation, the submission orchestration hook, and the shared
  transfer state owner. Reusable authentication logic belongs outside route files.
- Use the native authentication interface for capability discovery and biometric
  results; use the typed API service for demo PIN verification. Expose outcomes sufficient to distinguish
  success, cancellation, unavailability, and recoverable failure. Do not create a
  second transfer orchestrator or duplicate reviewed transfer data.
- Use the installed Expo SDK's compatible LocalAuthentication module and config
  plugin. Current baseline is SDK 58. Configure Face ID permission through app
  configuration, not hand-created native directories. Require strong Android
  biometrics; weaker-only devices use banking PIN.
- Disable OS credential fallback: the fallback is the banking PIN, not the phone's
  PIN, pattern, or password. Native prompt presentation can differ by platform.
  Provide an explicit app-controlled switch without treating ordinary Cancel as
  a request for PIN entry. No overlapping native prompts or PIN attempts.
- Pass reviewed details and authentication to `POST /transfer-authorizations`:
  `{ "method": "pin", "pin": "111111" }` or a successful native biometric result
  `{ "method": "biometric", "success": true }`. Verify the PIN and enforce attempt
  limits during authorization. No separate verification endpoint or proof is used.
  Never log, persist, or put credentials into transfer state, analytics, Query
  mutation variables, or submission payloads. PIN setup, changes, recovery, and
  production verification remain excluded.
- PIN input is masked, exactly six numeric digits, with an explicit Confirm
  transfer action. Clear entered digits on incorrect submission and screen exit.
  Provide accessible labels, error feedback, and reachable controls with keyboard
  and larger text. Do not announce the entered secret.
- Five incorrect entries cause a 30-second PIN-only cooldown. Attempt counts and
  expiry are enforced by the mock backend for the shared demo account across
  devices. Reset counts after successful PIN verification or cooldown expiry;
  app restart does not reset protection. Backend reset/restart clears demo state.
  Base cooldown on an expiry time so background time is included. Show remaining
  wait and prevent confirmation until expiry. Biometrics retain OS-owned limits.
- Start biometrics on confirmation when usable; otherwise offer PIN directly.
  Failures and timeouts offer Retry biometrics, Use banking PIN, and Back to review
  where applicable. Cancellation returns to review without API calls. Preserve
  reviewed details in every authentication failure or cancellation path.
- Add authentication lifecycle protection before existing approval/submission.
  Invalidate abandoned attempts and ignore late native callbacks after cancellation,
  backgrounding, navigation, or changed details. Genuine backgrounding abandons
  authentication; native prompt activity alone must not do so. Returning never
  automatically sends or reopens a prompt. Clear PIN input on abandonment.
- Authentication is supplied for one reviewed transfer attempt and
  immediately starts approval/submission. Prevent repeated taps synchronously.
  Approval failure or expired approval requires fresh authentication. No remembered
  authentication or app-login flow is introduced.
- Preserve unresolved-submission recovery unchanged: replay original details,
  approval ID, and idempotency key; do not authenticate anew or replace approval
  during that replay. Already-submitted work follows existing recovery semantics.
- Update developer README instructions with native development-build setup, demo
  PIN, limitations, and a device verification checklist. Remove obsolete simulated
  authentication copy. No visual redesign is requested.

## Testing Decisions

- The user performs physical Android and iOS verification. The implementation
  session must not claim those checks passed without actual results.
- Test observable transfer behavior, API call ordering, and absence of unintended
  submissions, not internal hook calls or component structure.
- Prefer the complete transfer flow as the highest verification seam. Use the
  single authentication interface to simulate outcomes when needed; do not expose
  simulated-success controls in the customer flow. Existing standalone mock API
  developer controls exercise approval failures and uncertain submission recovery.
- Preserve the existing manual verification scope; do not introduce a test suite
  or framework. Formatting, Expo lint, and TypeScript checks remain required.
- Checklist on both platforms: biometric success; no enrollment/hardware; biometric
  lockout; explicit PIN switch; valid/invalid/short PIN; fifth failure and cooldown;
  navigation during cooldown; biometric success during cooldown; app restart;
  cancellation; timeout; background and return; native prompt lifecycle; late
  success after abandonment; rapid repeated confirmation; editing reviewed details;
  approval failure; expired approval; uncertain submission replay; confirmed receipt.
- Check Android weaker-only biometric fallback and iOS Face ID permission refusal.
  Verify accessibility, keyboard reachability, and larger text on PIN/error states.
- Verify no authorization calls occur without PIN input or native biometric success; no
  submission occurs before approval. Verify no
  PIN is logged or included in submission payloads. Verify uncertain replay debits only once.

## Out of Scope

- Production banking PIN security, backend identity verification, enrollment,
  changing/recovering PINs, persistent lockout, and cryptographic attestation.
- OS device-credential fallback, app login, remembered authentication, and redesign.
- New test frameworks, automated suites, or agent-claimed physical-device results.
- Changes to existing unresolved-submission recovery policy.

## Further Notes

The agreed product specification and glossary have been updated. The fixed PIN is
an demo simulation; real device biometrics do not make the simulated backend
verify identity. Physical-device acceptance remains pending the user's checks.

Implementation sequence: introduce authentication boundary and lifecycle state;
connect native biometrics and PIN UI to reviewed transfer approval; preserve
recovery; update developer documentation; run static checks; hand off device checks.

Consult [Expo SDK 58 LocalAuthentication documentation](https://docs.expo.dev/versions/v58.0.0/sdk/local-authentication/).
Face ID requires a development build rather than Expo Go. Recheck installed SDK
and matching documentation before implementation. Platform lifecycle behavior and
explicit fallback interaction require native verification, not static inference.

## Implementation status

Implemented in the same session after the user authorized execution. The review
screen offers an explicit PIN action on both platforms; native Cancel retains its
return-to-review meaning. iOS also exposes the native banking-PIN fallback action.
Formatting, lint, TypeScript, and focused runtime checks of authentication guards,
stale attempt rejection, original-request recovery, and PIN cooldown passed.
Physical-device verification remains assigned to the user; no native prompt or
lifecycle scenario is claimed as verified.

## Backend PIN verification update

PIN verification and attempt limits now belong to the existing mock API. The
fixed credential remains demo-only. The simulated biometric method is
still client-declared, so this API does not provide production identity security.
