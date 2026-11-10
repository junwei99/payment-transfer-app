# Payment transfer user story specification

Status: ready-for-agent

## Authority and scope

This document defines the agreed finished product alongside the
[original product requirements](requirements.md). Use both throughout
development. The original requirements define the product requirements; this specification
resolves product behaviour, acceptance criteria, and agreed scope choices.
Raise conflicts between them explicitly rather than silently choosing one.

This is a product specification, not a phase plan or implementation status report.
Temporary shortcuts and existing prototype behaviour do not satisfy these
requirements. In particular, the finished product requires real device
authentication. Earlier plans allowing simulated authentication describe partial
implementation only and cannot override this specification.

Use the terms in the [domain glossary](../GLOSSARY.md). Follow the existing
[technology choices](tech-choices.md) and [API decision](adr/0001-post-only-body-api.md).
Future scope changes should update this specification explicitly.

## Problem Statement

A mobile bank customer needs to send money to a recipient, understand how much
is available to send, review the destination and amount, and approve the payment
using real biometrics or the demo banking PIN. The customer needs clear feedback when input is invalid,
authentication is cancelled, funds are insufficient, or connectivity fails.

A lost response must not misleadingly imply that no money moved or encourage an
accidental duplicate transfer. A confirmed payment must produce a receipt even
when a later balance refresh fails.

## Solution

Provide an iOS and Android payment transfer flow for one MYR account. The customer
selects or enters a recipient, enters an amount and optional note, reviews the
details, and confirms using biometrics or the demo banking PIN
fallback. Following successful authentication, the app requests transfer approval
and submits the transfer to the standalone simulated backend.

The backend owns the available balance and completed transfer records. The app
shows API-confirmed results, supports explicit recovery of uncertain submissions
within the current app session, and presents a receipt for completed transfers.
No sign-in or account switching is required. A visible demo banner is not required.

## User Stories

### Account and data availability

1. As a customer, I want to open the transfer form directly, so that I can begin without a separate sign-in flow.
2. As a customer, I want to see my available balance in MYR, so that I can judge the amount I can send.
3. As a customer, I want a clear loading state while account data is first fetched, so that I understand why I cannot proceed yet.
4. As a customer, I want an account-loading error and a retry action, so that I can recover without seeing an invented balance.
5. As a customer, I want the balance to refresh when I return to the app or reconnect, so that I can see updated funds.
6. As a customer, I want the previous balance to remain visible during refresh, so that the screen remains usable.
7. As a customer, I want to know when a balance refresh fails, so that I understand the displayed value may be outdated.

### Recipient and transfer input

8. As a customer, I want to select a recipient from the supplied list, so that I do not need to retype their details.
9. As a customer, I want to enter a recipient name and account number manually, so that I can send to someone outside the list.
10. As a customer, I want leading zeros in account numbers preserved, so that the destination is not changed.
11. As a customer, I want separate errors for missing names and invalid account numbers, so that I know which field to correct.
12. As a customer, I want manual entry to remain available when the recipient list is empty or fails to load, so that I can still prepare a transfer.
13. As a customer, I want to retry loading recipients, so that a temporary failure does not permanently remove selection.
14. As a customer, I want smooth scrolling through a long recipient list, so that choosing a recipient remains responsive.
15. As a customer, I want to enter an amount in ordinary MYR decimal notation, so that I do not need to calculate sen myself.
16. As a customer, I want invalid or overly precise amounts rejected, so that the app does not silently send a rounded amount.
17. As a customer, I want guidance when my amount exceeds the displayed balance, so that I can reconsider before submitting.
18. As a customer, I want to add an optional note, so that I can include a reason for the transfer.
19. As a customer, I want to know when a note exceeds its limit, so that I can shorten it before proceeding.
20. As a customer, I want blank required fields to remain invalid, so that example values are never sent on my behalf.

### Review and authentication

21. As a customer, I want to review the recipient name, full account number, amount, and note, so that I can check exactly what will be sent.
22. As a customer, I want to return from review and edit my details without losing them, so that correcting a mistake is straightforward.
23. As a customer, I want authentication to start when I confirm the reviewed transfer, so that the prompt is tied to my intent to send.
24. As a customer, I want to authenticate using my device's supported biometrics, so that I can approve the transfer through device security.
25. As a customer, I want a demo banking PIN fallback, so that I can authenticate when biometrics cannot be used.
26. As a customer, I want biometrics handled by the operating system and banking PIN entry clearly distinguished, so that I never enter my device credential into the app.
27. As a customer, I want cancelling authentication to return me to review with my details intact, so that I can decide whether to try again.
28. As a customer, I want understandable feedback after failed or unavailable authentication, so that I can retry or use the supported fallback.
29. As a customer, I want banking PIN entry when no usable device security is configured, so that I can complete the transfer flow.
30. As a customer, I want changed transfer details to require fresh authentication and approval, so that my earlier approval cannot send a different payment.
31. As a customer, I want an expired approval to require a fresh authentication and approval step, so that I can resume sending the reviewed payment safely.

### Submission and error recovery

32. As a customer, I want the app to request transfer approval only after successful biometric or demo banking PIN authentication, so that cancelling authentication cannot send money.
33. As a customer, I want a clear error when transfer approval is rejected or unavailable, so that I know submission has not proceeded.
34. As a customer, I want visible progress while approval and submission run, so that I know the app is processing my action.
35. As a customer, I want repeated taps prevented from creating multiple submissions, so that I do not accidentally send twice.
36. As a customer, I want an insufficient-funds rejection to preserve my details, so that I can correct the amount and try again.
37. As a customer, I want success shown only after the backend confirms completion, so that the receipt represents an actual completed transfer in the service.
38. As a customer, I want the app to distinguish an unknown outcome from a rejected transfer, so that I do not assume a lost response means nothing happened.
39. As a customer, I want to explicitly retry an uncertain transfer using the original request, so that I can recover without creating a second payment.
40. As a customer, I want retry wording to explain that retry may complete the payment, so that I understand the action is more than a read-only status check.
41. As a customer, I want editing and new transfers blocked while submission is running or unresolved, so that I finish dealing with the current attempt first.
42. As a customer, I want reconnecting or returning to the app to avoid automatically sending a payment, so that submission remains an explicit action.
43. As a customer, I want an unresolved transfer retained while the app session remains alive, so that leaving and returning to the app does not discard recovery information.

### Confirmation and another transfer

44. As a customer, I want a receipt with the recipient, amount, note when present, reference, completed status, and completion time, so that I can check the result.
45. As a customer, I want receipt times displayed in my device's local timezone, so that I can interpret when the transfer completed.
46. As a customer, I want confirmation to load a completed transfer by its ID, so that it does not depend solely on the preceding screen's local receipt state.
47. As a customer, I want receipt-loading errors and retry controls, so that I can recover when receipt retrieval fails.
48. As a customer, I want a clear message when a receipt cannot be found, so that I am not shown fabricated transaction details.
49. As a customer, I want a confirmed receipt to remain successful if balance refresh fails, so that a later read error does not misrepresent my payment.
50. As a customer, I want to start another transfer with an empty form and a refreshing balance, so that previous recipient and amount values are not reused accidentally.

### Mobile usability

51. As an iOS or Android customer, I want the same transfer rules on either platform, so that the flow behaves consistently despite different system authentication prompts.
52. As a customer using a small screen, I want the keyboard and safe areas to leave fields and actions reachable, so that I can complete the form.
53. As a customer using a screen reader, I want meaningful field and button labels and announced progress or results, so that I can follow the transfer flow.
54. As a customer using larger text, I want content and actions to remain readable and usable, so that text scaling does not prevent sending.
55. As a customer, I want errors explained in text rather than colour alone, so that I can understand what needs attention.
56. As a customer, I want responsive interactions and smooth transitions, so that typing, scrolling, and moving between screens remain comfortable.

## Acceptance Criteria

### Account, recipients, and refresh

- There is one account and one currency, MYR. Display monetary values with two
  decimal places. The client never substitutes a hardcoded balance for missing data.
- Initial account loading or failure prevents proceeding to review. A previously
  loaded account may remain visible and usable when a background refresh fails.
- Account and recipient states are independent. Recipient-list failure or an empty
  list does not prevent valid manual entry when account data is available.
- Account data is immediately eligible for refresh. Recipient data is reusable
  for five minutes. Refresh stale active reads on foreground and reconnection;
  these rules do not require periodic polling.
- Retry transient read failures once automatically. Do not automatically retry
  invalid responses or definitive API rejections. Provide manual retry after a
  failed initial read and report failed background refreshes.
- Showing cached data must not imply that a failed refresh succeeded. Read refresh
  must not overwrite the user's draft or reset a transfer in progress.

### Input and review

| Field     | Accepted behaviour                                                                                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recipient | Choose a supplied recipient or enter a name and account manually. A selection populates the reviewed destination.                                                                  |
| Name      | Required and nonblank after trimming surrounding whitespace. No account-ownership verification is implied.                                                                         |
| Account   | Exactly ten ASCII digits after trimming surrounding whitespace. Keep it as text and preserve leading zeros.                                                                        |
| Amount    | Positive MYR amount convertible exactly into a safe integer number of sen. Accept up to two decimal places.                                                                        |
| Note      | Optional. Trim surrounding whitespace; preserve internal spaces and line breaks. Whitespace-only input becomes empty. Enforce the existing API's length limit after normalization. |

- Accept examples such as `10`, `10.5`, `10.50`, `.50`, and `0010.50`. Trim
  surrounding whitespace. Normalize `10.` to RM10.00 when leaving the field.
- Reject empty amounts, zero, negative values, commas, currency symbols,
  exponential notation, excess decimal places, and values outside the safe
  minor-unit range. Never round invalid precision into a different valid amount.
- The note limit is 200 UTF-16 code units, matching the existing JavaScript/API
  contract. Some emoji occupy more than one unit; client validation must agree
  with the server rather than accepting a note the API will reject.
- Show separate field errors and preserve entered values for correction. Blank
  required fields must not receive example recipient or amount substitutions.
- Warn when the amount exceeds the displayed available balance. The backend's
  submission-time balance check is authoritative because cached balance can be stale.
- Review shows the full recipient account number, recipient name, amount with two
  decimal places, and normalized note when nonempty. Submit exactly these reviewed
  details. No bank selector, fee calculation, or daily limit is required.
- Back from review preserves the draft. Editing reviewed details invalidates any
  existing authentication/approval for those details.

### Device authentication and transfer approval

Use real device biometrics with a backend-verified demo banking PIN of `111111`.
PIN setup, recovery, and production verification are out of scope.
`POST /transfer-authorizations` receives reviewed details and an authentication
object: `{ "method": "pin", "pin": "111111" }` or
`{ "method": "biometric", "success": true }`. The backend verifies the PIN and
enforces attempt limits before issuing approval in the same request. No separate
PIN verification endpoint or intermediate proof is used. Never log or persist
credentials, or include them in journey state, Query mutation variables, or
transfer submission payloads. Biometric success remains a client-declared backend
simulation. Document demo limitations and setup instructions in the README.

The demo PIN remains available without enrolled biometrics or a device screen
lock. Start with biometrics when available, with an explicit banking-PIN
alternative; offer PIN directly when biometrics are unavailable or locked out.
Cancellation returns to review with details preserved rather than automatically
opening PIN entry.

PIN entry is masked, accepts six numeric digits, and requires an explicit Confirm
transfer action enabled only after six digits. Prevent duplicate submissions and
clear the PIN on exit and after incorrect entry. Five incorrect attempts trigger
a server-enforced 30-second cooldown shared by the demo account across devices.
App restarts do not reset it; backend restart or reset does. Preserve the transfer details and display
clear failure feedback. Document the demo PIN in the README.

Leaving the app during authentication abandons the attempt and requires fresh
authentication on return, preserving transfer details. The native biometric
prompt itself must not be mistaken for leaving the app. Already-submitted
transfers retain their existing recovery behavior. Each new transfer requires
fresh authentication; app login and remembered authentication are out of scope.

The cooldown blocks PIN attempts only; biometrics remain available. Keep failed
attempt counts on the backend, resetting after successful PIN verification or
cooldown expiry. Require strong Android biometrics. Failed, timed-out, or
interrupted biometrics offer retry, PIN, or Back to review as applicable.
PIN confirmation or successful native biometrics requests approval and submits without
another confirmation. Approval failure requires fresh authentication on retry.
See the [implementation handoff](../.scratch/device-authentication/spec.md).

- The normal sequence is entry, review, Confirm transfer, device authentication,
  API transfer approval, submission, and confirmation.
- Use real operating-system biometric prompts, with the app's demo PIN as the
  alternative. Do not collect device screen-lock credentials or enable OS
  device-credential fallback as a third authentication method.
- Cancellation returns to review without approval or submission. Failed,
  interrupted, or timed-out authentication cannot count as success. The OS
  controls biometric attempt limits and lockout; the backend controls demo PIN limits.
- Prevent repeated confirmation actions from launching overlapping authentication,
  approval, or submission flows.
- Request API transfer approval with PIN input or a successful native biometric result. An approval
  failure ends that attempt before submission and displays an actionable error.
- Transfer approval binds the reviewed recipient, amount, currency, and note. The
  existing service issues five-minute approvals; the returned expiry is authoritative.
- A fresh attempt after editing or expired approval requires authentication and a
  new approval. This does not replace the saved approval in an uncertain submission:
  recovery of that submission must replay its original request unchanged.
- Device authentication approves a transfer; it is not an app login. The simulated
  backend does not independently verify biometric proof, and the app must not
  describe this as production bank identity verification.

### Submission lifecycle

| State                                 | Required behaviour                                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Ready for review or authentication    | Allow correction and cancellation without sending.                                                          |
| Authenticating or requesting approval | Show progress, prevent duplicate actions, and do not submit without successful prerequisites.               |
| Submitting                            | Show progress; prevent Back, edit, and new-transfer actions that discard or replace the attempt.            |
| Outcome unknown                       | Explain uncertainty; retain the original request and offer explicit retry. Block editing and new transfers. |
| Definitively rejected                 | Explain the reason, retain draft details for correction, and do not show a completed receipt.               |
| Completed                             | Show the backend-confirmed receipt and refresh account data independently.                                  |

- Each new submission has its own idempotency key. Retain the exact request body,
  including transfer details, approval ID, and key, while its result is unresolved.
- Neither approval nor submission automatically retries. Offline state must not
  queue a payment to send automatically on reconnect. Submission and recovery
  require explicit user actions.
- Timeouts, lost connections, client cancellation, or invalid submission responses
  can hide a completed transfer. Show an unknown outcome rather than claiming the
  payment failed. An HTTP failure alone is insufficient to classify the outcome;
  use the validated endpoint error contract.
- Explicit recovery resends the identical body and key. Never obtain a replacement
  approval or generate a fresh key as part of replaying an uncertain submission.
  The service returns the original completed transfer for an identical successful
  replay without another debit.
- Label recovery as a retry and explain that it can complete a request that did
  not previously arrive. It is not a read-only status lookup.
- A definitive insufficient-funds or other pre-commit rejection does not deduct
  funds. Allow the user to correct/retry as appropriate to the error. Do not treat
  approval-consumed or idempotency-conflict errors as proof that no payment exists.
- A balance change alone is never evidence that a specific transfer completed.
- Screen blur, Android Back, and other in-app navigation must not discard an
  unresolved attempt. Backgrounding preserves it only while the process survives.
- Closing or terminating the app loses recovery information. No restart recovery
  or persistent draft guarantee is provided.

### Confirmation

- Only a validated completed transfer response establishes success. Do not
  optimistically deduct the balance, fabricate a reference, or display a success
  receipt before confirmation from the backend.
- Show recipient name, full account number, MYR amount, nonempty note, completed
  status, backend reference, and backend completion timestamp in device-local time.
- Identify the confirmation screen by transfer ID. Use the successful response
  immediately when available and support fetching the receipt by that ID.
- Missing IDs, unknown IDs, loading, and retrieval failure have usable states;
  none should invent receipt values or imply a new transfer was submitted.
- Keep a known successful receipt visible if subsequent receipt or balance reads
  fail. Report refresh failures separately. Never offer payment resubmission as a
  remedy for a receipt-read or balance-read failure.
- Make another transfer clears the draft, starts a new flow, and refreshes the
  account. Clearing local input never resets backend funds or transfer records.

### Mobile usability and performance

- Support iOS and Android with the same product rules and platform-appropriate
  system authentication. Web is not an acceptance target.
- Keep form controls and primary actions reachable with the keyboard open, small
  screens, device safe areas, and larger text settings.
- Provide accessible labels, text explanations of errors, and appropriate progress
  and result announcements. Do not rely only on colour to communicate state.
- Render recipient lists efficiently so larger datasets do not require mounting
  every row at once. Typing should not cause unnecessary list-wide work.
- Maintain responsive input and smooth navigation/transitions. Do not add artificial
  client delays or animation that obscures errors or completion.

## Implementation Decisions

- Use Expo, React Native, TypeScript, and Expo Router. Keep route responsibilities
  separate from reusable UI, domain flow state, query hooks, and services. Preserve
  the established styling approach and visual design.
- Use TanStack Query for account, recipient, and transfer-by-ID reads, and mutations
  for approval and submission. Maintain stable query keys and a stable QueryClient.
  Seed a completed transfer's cache entry from its validated submission response.
- Wire React Native foreground and network status into Query focus/connectivity
  handling. Disable automatic mutation retry and automatic offline submission.
- Keep draft, validation, reviewed details, authentication UI, and unresolved
  request state in local React state or a small flow context. Do not add Zustand,
  persistent Query storage, or cached authentication results.
- Retain the Axios requestor and Zod response boundary. Validate external responses
  before use or caching. Adapt service failure results into thrown Query errors
  while preserving API, transport, and response-validation categories.
- The requestor requires an explicitly configured API URL, defaults to a 30-second
  timeout, supports cancellation, and never retries itself. Cancellation does not
  establish that a submitted payment was not committed.
- Preserve the existing POST JSON-body contract for all operations, including
  reads. Transfer lookup takes a transfer ID; submission carries its idempotency
  key in the body. There is no lookup by idempotency key.
- The banking service exposes account, recipients, transfer approval, submission,
  PIN verification, and transfer lookup. Health, scenario configuration, and backend reset are
  developer operations and are not exposed as customer UI actions.
- Use integer minor units for money. Infer client API types from schemas and keep
  presentation formatting separate from wire values. No further backend contract expansion
  is required for the agreed product scope.
- Retain the standalone simulated backend as the owner of balance, approval,
  transfer, and replay records. Remove client mock gateways, fixed receipts,
  scripted biometric success, scenario controls, and runtime mock fallback data.
- Integrate device authentication using an Expo-compatible native capability;
  configure native behaviour through app configuration/plugins. Check the installed
  Expo version and corresponding documentation before selecting APIs. Validate real biometrics and the demo PIN fallback on both platforms.
- Clear authentication and approval eligibility when reviewed details change.
  Preserve an already-submitted request separately until its result is resolved.

## Testing Decisions

Verification is manual. Do not introduce an automated test suite or framework as
part of this scope. Formatting, lint, and TypeScript checks remain mandatory under
the repository's development instructions.

Use the highest existing boundary: a customer completes the mobile flow against
the standalone API. Exercise device authentication through the actual OS prompt
and backend failures through external developer controls. Inspect returned receipts
and account balances to establish results, not internal hook calls or component
render counts. No new test-only application interface is required.

Prior art is the existing simulated service's approval outcomes, insufficient-funds
and fail-once responses, delay controls, reset operation, and API-layer manual
verification guidance. Additional external network fault injection may be needed
to reproduce lost responses or invalid payloads. Do not restore customer-facing
scenario buttons merely to support verification.

The following checks cover the form/review, native authentication, service and
Query integration, submission recovery, receipt, and mobile presentation modules:

| Manual scenario                                                         | Expected observable result                                                                                                          |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Initial account loading/failure/retry                                   | Progress or error is visible; no invented balance; proceeding waits for account data.                                               |
| Empty or failed recipient list                                          | Manual entry still works; failed loading offers retry.                                                                              |
| Normalized input and invalid input                                      | Leading zeros survive; accepted decimal forms show the intended amount; invalid precision is not rounded; note rules match the API. |
| Review, Back, and edits                                                 | Draft survives; review matches submitted details; edits require fresh authentication/approval.                                      |
| Biometric success on iOS and Android                                    | A real OS prompt precedes approval and submission.                                                                                  |
| Demo banking PIN fallback                                               | App PIN 111111 succeeds, including without device security; incorrect PIN and cooldown behave as specified.                         |
| Cancellation, failure, interruption, lockout, or no device security     | No submission occurs without success; details survive; explicit retry or banking PIN fallback is appropriate.                       |
| Approval failure or expiry                                              | No unapproved submission; clear error or fresh authentication/approval step.                                                        |
| Insufficient funds                                                      | Clear rejection; no debit; details remain available for correction.                                                                 |
| Repeated Confirm/Retry taps                                             | Only one active attempt and no duplicate completed payment.                                                                         |
| Submission commits but its response is lost                             | Unknown outcome is shown; same-request recovery returns the receipt and balance is deducted only once.                              |
| Submission never reaches the server                                     | Explicit same-request retry can complete it, or returns an appropriate definitive rejection if approval has expired.                |
| Invalid submission response                                             | No fabricated success or claim of definite noncompletion; original recovery request remains available.                              |
| Navigation/backgrounding during uncertainty                             | In-session recovery survives; edit/new transfer remain blocked; reconnect does not automatically submit.                            |
| Successful submission with failed balance refresh                       | Receipt remains successful; refresh error is separate.                                                                              |
| Receipt opened by ID, missing ID, unknown ID, or read failure           | Correct receipt or usable loading/error/not-found state; never a fabricated receipt or payment resubmission.                        |
| Make another transfer                                                   | Empty draft and refreshing account; backend records and funds are not reset.                                                        |
| App termination during uncertainty                                      | No restart recovery is claimed; refreshed balance is not treated as proof of the prior transfer.                                    |
| Long recipient list, small screen, keyboard, larger text, screen reader | Responsive scrolling and reachable, readable, labelled controls and understandable state announcements.                             |

Run device-authentication checks in suitable native builds. Expo's
[SDK 58 LocalAuthentication documentation](https://docs.expo.dev/versions/v58.0.0/sdk/local-authentication/)
states that Face ID requires a development build rather than Expo Go. Record the
platforms and scenarios actually verified; static checks cannot establish that
native authentication or recovery scenarios passed.

## Out of Scope

- App sign-in, registration, account switching, multiple accounts, and other currencies.
- Contact-list integration and recent transfer history, including quick re-send.
  These remain optional stretch goals from the original requirements.
- Bank selection, recipient ownership verification, transfer fees, and daily limits.
- Banking PIN enrollment, changes, recovery, app-collected device credentials, and production identity
  verification or cryptographic biometric attestation by the simulated backend.
- Persistent drafts, secure storage of submissions, recovery after app termination,
  persistent Query caches, offline payment queues, and multiple unresolved transfers.
- Receipt export, sharing, and a visual redesign.
- Automated tests or a new test framework.
- Repository submission/access, commit-history criteria, setup-document delivery,
  a design write-up, and a demo video as acceptance criteria of this product spec.
  The original requirements still contains those submission instructions; excluding
  them here does not remove them from the original document.

## Further Notes

- The backend simulates payments and does not move real money. Biometric authentication
  is real; the fixed banking PIN is an demo simulation. No visible demo banner is required, but copy must not invent guarantees
  about real bank processing or verified recipient ownership.
- Backend state is shared by clients using that service and is held in memory.
  Restarting or resetting the service removes approvals, receipts, and idempotency
  records. Same-key recovery guarantees assume those records remain available;
  they do not survive a backend reset. Do not reset the backend during a recovery
  verification scenario.
- Closing the app loses unresolved recovery information even if the server has
  completed the payment. This is an accepted demo limitation, not a promise
  of durable payment recovery.
- Existing prototype screens and earlier phase plans are implementation references,
  not evidence that any acceptance criterion has passed. This specification
  requires the completed real-authentication flow without temporary shortcuts.
