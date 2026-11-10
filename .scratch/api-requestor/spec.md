# API schemas, requestor, and service declarations

Status: Implemented; Expo lint, app TypeScript, and standalone service TypeScript checks passed. Runtime verification remains manual.

## Scope

Build the API layer and adapt the standalone mock service. Implementation
was authorized with “go”; follow [plan.md](plan.md).
Use `/Users/junwei/Documents/source-code/location-guesser/apps/frontend/`
and its `libs/shared-schemas/src/api.schema.ts` as references, adapting their
response envelope to this service's raw success bodies and error envelopes.

Keep the current UI and client mocks working until the later TanStack Query
integration. Add TODO comments at all mock handling sites during implementation.
No Query integration, screen fetching, real device authentication, or automated
tests in this phase. The user verifies runtime behavior; the implementer runs
lint and TypeScript checks.

## Agreed contract

- All eight endpoints use POST and JSON bodies, including health and mock controls.
- Request schemas describe only the body. Infer request input types from Zod;
  do not validate, transform, default, or strip outgoing data at runtime.
- Registration requires request, success-response, and error-response schemas.
- Infer response output types from schemas. Parse 2xx bodies with the success
  schema and other HTTP responses with the error schema.
- Accept and strip extra response fields, including nested object fields.
  Missing or invalid required fields produce parse-error.
- Error envelopes remain `{ error: { code: string, message: string } }`.
- Return validated success data directly, without success HTTP metadata. Expected
  failures throw the shared ServiceError with a discriminated failure payload:
  api-error (parsed envelope/status, including endpoint-specific PIN retryAt),
  parse-error (expected success/error, issues/status), or transport-error
  (timeout/cancelled/network reason and message). This replaces the original
  returned result union and Query-level unwrap adapter.
- Unexpected programming/configuration errors propagate unchanged. No required
  registration callbacks; callers handle rejected promises. Retry and transfer
  recovery policies remain outside the requestor.
- Default timeout is 30 seconds. Support AbortSignal and no automatic retries.
- Service URL comes from EXPO_PUBLIC_API_URL with no hardcoded fallback;
  supply an example environment file and simulator/physical-device instructions.
- Transfer lookup is POST /transfers/lookup with `{ id }`.
- Submission moves Idempotency-Key into body field `idempotencyKey`.
  Preserve existing replay, approval binding, expiry, and conflict behavior.
- Developer reset/config services and health service are separate from banking services.

A timeout or cancellation does not establish that a transfer failed: the service
can commit before delaying its response. Recovery and retry orchestration belong
to the later screen integration and must retain the original body and key.

## Client scope update

Health and developer controls had no client consumers and were removed from
client service declarations, schemas, and registry at the user’s request.
The five banking endpoints remain in the client. All eight server endpoints
remain available, including health and mock controls for manual development.
