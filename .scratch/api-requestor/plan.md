# API layer execution plan

Status: Implemented; Expo lint, app TypeScript, and standalone service TypeScript checks passed. Runtime verification remains manual.

## 1. Dependencies and layout

Read AGENTS.md and docs/tech-choices.md. Preserve unrelated staged/working changes.
Add Axios and Zod with pnpm and update pnpm-lock.yaml. Choose versions compatible
with the existing TypeScript setup and consult their official documentation when
implementing. Expo is currently ~58.0.23; check the installed version again and
use its matching documentation before changing Expo or React Native APIs.

Implementation layout (updated to follow the location-guesser frontend format):

- src/schemas/common.schema.ts: shared wire objects.
- src/schemas/apis/*.schema.ts: one request/success/error/API schema per endpoint.
- src/schemas/api.schema.ts: API_SCHEMA registry, helpers, and inferred endpoint types.
- src/utils/requestor.utils.ts: createRequestor exposing createRequest(endpoint).
- src/services/index.services.ts: grouped bankingService declarations.

Keep route files and existing presentation types separate from API wire types.
Do not import backend runtime code into the mobile app or migrate the backend to Zod.

## 2. Adapt the mock service contract

Update services/mock-api/src/index.ts and validation.ts:

| Endpoint                      | Request body                          | Successful response                   |
| ----------------------------- | ------------------------------------- | ------------------------------------- |
| POST /health                  | {}                                    | { status: "ok" }                      |
| POST /account                 | {}                                    | { id, balanceMinor, currency: "MYR" } |
| POST /recipients              | {}                                    | Array of { id, name, account }        |
| POST /transfer-authorizations | Transfer details                      | { approvalId, expiresAt }             |
| POST /transfers               | Details + approvalId + idempotencyKey | Completed transfer                    |
| POST /transfers/lookup        | { id }                                | Completed transfer                    |
| POST /__mock/reset            | {}                                    | { account, config }                   |
| POST /__mock/config           | Partial config                        | Config                                |

Parse JSON bodies with existing server validation, including empty-body contracts.
Remove GET/PUT aliases and the dynamic transfer lookup route. Keep method rejection
and Allow headers accurate. Update documentation and curl examples, including health.

Require a nonblank idempotencyKey of at most 200 characters in submission bodies.
Read the body once; permit the new field in submission validation only. Keep it
separate from normalized transfer details. Continue passing details, approvalId,
and key to MockBank.submit so replay comparisons and approval matching retain
current behavior. Update header-specific error text. Preserve status codes,
response shapes, and commit-before-delay behavior.

## 3. Define schemas

Derive contracts from services/mock-api/src/bank.ts and validation.ts:

- Details: recipient name/account, positive safe integer amountMinor, MYR currency,
  and optional note of at most 200 characters. Account is exactly ten digits.
- Completed transfer: details with required normalized note, id, reference,
  status literal completed, and ISO createdAt.
- Account: id, nonnegative safe integer balanceMinor, MYR currency.
- Approval: approvalId and ISO expiresAt.
- Config: approvalOutcome enum, transferOutcome enum, and integer responseDelayMs
  from 0 through 30000. Config update fields are optional.
- Error: nested error with string code and message, shared across endpoints.

Use Zod object schemas that strip unknown response properties. Do not introduce
request transformations/defaults that would imply runtime behavior the wrapper
never executes. Request types use z.input; parsed responses use z.output.

## 4. Implement the requestor

Expose a factory accepting baseURL and an optional timeout (default 30000).
The API_SCHEMA registry requires request, successResponse, and errResponse
schemas. createRequest(endpoint) returns `(body, options?) => Promise<ApiResult<...>>`.
Options expose AbortSignal; HTTP method is always POST. Do not expose Axios config
that could bypass method, URL, body, status handling, or schema validation.

Keep Axios response data unknown until parsing. Let HTTP responses of all statuses
reach the parsing branch. Preserve malformed JSON as a response parsing failure,
not a network failure; configure decoding accordingly. Parse success/error bodies
with their respective schemas and return the agreed union from spec.md. Do not
return raw Axios responses or unvalidated data. Avoid logging financial payloads.

Transport failures distinguish timeout, cancellation, and network failures.
Unexpected programming/configuration errors should remain diagnosable rather than
being disguised as network failures. Do not retry or generate idempotency keys.

Check typing through the implementation and tsc: required schemas cannot be omitted;
body/return types are inferred; narrowing kind exposes the corresponding properties.
Do not add automated test files or a test runner.

## 5. Declare services and configure connectivity

Declare getAccount, getRecipients, authorizeTransfer, submitTransfer, getTransfer,
resetMock, configureMock, and getHealth using the registry/requestor. Read service
names can retain get prefixes even though transport uses POST.

Read EXPO_PUBLIC_API_URL when creating the requestor. Reject missing/invalid configuration with a
clear setup error when the client is created; avoid affecting the existing UI,
which does not import these services yet. Use no fallback URL. Supply .env.example
and README instructions for simulator and LAN device access. Verify Expo guidance
before documenting environment loading. Configuration contains no secrets.

## 6. Mark deferred client mock removal

Add focused `TODO(api-integration): ...` comments at each independent mock behavior,
with a pointer to this plan. Search all src files before declaring coverage complete.

- src/transfer/mock-transfer.ts: fixture loading, scripted validation/authentication,
  scenario flags, artificial delay, fake failure/retry outcomes, fixed confirmation.
- src/transfer/transfer-context.tsx: gateway wiring, fixture/example substitution,
  mock review/authentication/submission, scenario selection/reset, in-memory results.
- src/transfer/types.ts: mock-only gateway/scenario contracts; keep genuine local
  form and presentation types until real integration decides their replacements.
- src/app/index.tsx: prototype scenario controls and mock-specific explanatory copy.
- src/app/authenticate.tsx: simulated biometric/passcode actions and outcome copy.
- src/app/confirmation.tsx: in-memory confirmation and mock reset behavior.
- src/transfer/components.tsx: prototype reset controls.
- Inspect review.tsx and remaining UI files for additional mock assumptions.

Comments must explain the replacement: API services through future Query integration,
actual input validation, device authentication, or removal of prototype controls.
Do not replace local form state indiscriminately or equate local draft reset with
resetting shared backend state. Do not wire new services into screens in this phase.

## 7. Documentation and checks

Update docs/tech-choices.md with the agreed client boundary and link the ADR.
Update services/mock-api/README.md and root setup documentation to the new methods,
body fields, timeout, and environment setup. Mark old mock-service spec contracts
as superseded by this spec where they conflict, preserving historical context.

Run pnpm exec expo lint and pnpm exec tsc --noEmit. Check the standalone mock
service with its own TypeScript configuration using its documented tooling.
Report check failures and distinguish pre-existing problems. Do not claim runtime
verification: the user owns manual verification and requested no automated tests.

Manual verification handoff should cover successful endpoints, server error bodies,
malformed success/error responses, extra-field stripping, timeout/cancellation,
unchanged client prototype behavior, and replay/conflict behavior after moving the
key. The server's maximum delay equals the default timeout; use a shorter configured
client timeout for a predictable manual timeout scenario.

## Deferred session

Add TanStack Query, connect screens, then remove marked client mocks. Integrate
actual device authentication separately from transfer approval. Preserve identical
submission details, approval ID, and idempotency key when retrying uncertain outcomes.
Read confirmations by transfer ID and distinguish local draft clearing from server
reset. Adapt result failures into Query errors as appropriate.

## Client scope update

Health and developer controls had no client consumers and were removed from
client service declarations, schemas, and registry at the user’s request.
The five banking endpoints remain in the client. All eight server endpoints
remain available, including health and mock controls for manual development.
