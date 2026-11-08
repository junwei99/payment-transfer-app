# Bun mock service

> Contract update: [API requestor spec](../api-requestor/spec.md) supersedes
> the historical methods, lookup path, and idempotency header below. All eight
> endpoints now use POST JSON bodies; lookup uses `/transfers/lookup` with `{ id }`,
> and submission uses body field `idempotencyKey`.

Status: ready-for-human

The user confirmed shared understanding and authorized implementation.
The service is implemented; developer manual verification is pending.

## Confirmed scope

- Build a simple mock service using Bun and TypeScript.
- Implement the service first. Mobile client integration is a later effort.
- Keep the service in this repository for local development and assessment demos.
- Hosted deployment is outside this scope.
- Implement functional simulation: validate transfers, reject insufficient
  funds, deduct the balance, and store successful transfers in memory.
- Authentication must also call the mock API, through the per-transfer
  authorization contract below.
- Return structured response data: money in integer minor units with a
  currency code, and timestamps in ISO format. Formatting belongs to the
  future client integration.
- Future client requests and responses use the production-shaped contract
  below. Mock behavior belongs inside the backend.
- All consumers share one demo account, balance, and transfer records.
  Seed the balance with MYR 5,000. Restarting the service or explicitly
  resetting it restores the fixtures.
- Use Bun's built-in HTTP server and TypeScript under `services/mock-api/`,
  with its own run and verification commands. No framework or database.
- Do not add Zod validation to the mock service. The existing client-side
  response validation decision in `docs/tech-choices.md` is outside this
  service-only scope.
- Authentication is approval of an individual transfer. App login is outside
  this scope. The future client performs device authentication and calls the
  mock API for the transfer approval step.
- Configure scripted failures and delays outside normal client requests,
  using service settings or developer-only control endpoints.

## Current behavior

The disposable UI prototype uses `src/transfer/mock-transfer.ts` through a
`TransferGateway`. It returns presentation fixtures and scripted review,
authentication, and submission outcomes. It has no HTTP transport, balance
arithmetic, or transaction storage.

`docs/tech-choices.md` describes a later functional service that owns balances
and transaction records. This effort adopts that functional simulation for
the new service while leaving the prototype's client integration for later.

## API contract

| Endpoint                        | Behavior                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| `GET /account`                  | Return the shared account's balance in integer minor units and currency.               |
| `GET /recipients`               | Return seeded recipients.                                                              |
| `POST /transfer-authorizations` | Approve supplied transfer details and return an approval ID valid for five minutes.    |
| `POST /transfers`               | Submit transfer details with the matching approval ID and an `Idempotency-Key` header. |
| `GET /transfers/:id`            | Retrieve a completed transfer by ID.                                                   |

Approval applies to the exact transfer details and permits one successful
submission. Normal client requests contain no scenario selectors. Error
responses contain a stable machine-readable code and a message.

## Transfer rules

- Require a recipient name and a 10-digit destination account number.
- Require a positive integer amount in minor units and currency `MYR`.
- Allow an optional note of up to 200 characters.
- Check the available balance at submission, including when approval was
  granted earlier. Deduct funds and store the completed transfer together.
- Invalid, rejected, and scripted failed transfers leave the balance unchanged.
- Return structured data and ISO timestamps; do not return formatted UI strings.

## Retry and completion behavior

- Require an `Idempotency-Key` header for transfer submission.
- Retrying the same key and transfer details returns the original completed
  transfer without another deduction, including after its approval was consumed.
- Reusing a key with different details returns a conflict.
- A committed transfer remains completed if the client disconnects. A client
  timeout alone is not evidence that a transfer failed.

## Demo controls

Provide developer-only endpoints, separate from the normal client contract,
to reset the service and configure scripted approval and transfer outcomes
and response delays. Controls affect the single shared demo account.

Support approval cancellation, unavailability, and rejection; forced
insufficient funds; and a transfer failure that succeeds on retry. With no
scripted failure configured, normal validation and balance rules apply.

## Verification

- Do not add automated tests. Developers manually verify the service.
- Include a README with startup instructions and curl examples covering the
  normal transfer flow, validation failures, approvals, insufficient funds,
  duplicate submission, scenario controls, retrieval, and reset.
- Include service run and TypeScript verification commands.
- Run the repository-required `pnpm exec expo lint` and
  `pnpm exec tsc --noEmit` before declaring implementation complete.

## Accepted operational defaults

These complete the design without extending its functional scope:

- Listen on `0.0.0.0:3001` for simulator and LAN-device access, with configurable
  host and port. Document how a device reaches the developer's machine.
- Keep dependencies and Bun types scoped to the service; preserve the Expo
  application's package manager and TypeScript configuration.
- Seed the existing three fictional recipients and a balance of 500,000 minor
  units (MYR 5,000).
- Expose `GET /health`, `POST /__mock/reset`, and `PUT /__mock/config` for
  developer operations. Reset clears transfers, approvals, idempotency
  records, and scripted failures, then restores the seed data.
- Default response delay to zero; developers can configure it explicitly.
- Use standard HTTP status codes and a consistent
  `{ "error": { "code": "...", "message": "..." } }` error body.
- Use direct TypeScript checks for request rules, without adding Zod.
- Keep the existing app mocks in place until the separate client integration.

## Implementation and handoff

The user confirmed the design with "go". The implementation lives in
`services/mock-api/`; its README contains the full request/response contract
and developer manual verification steps. Client integration remains deferred.

No automated tests were added, as requested. Service TypeScript verification
and the repository's required lint and type checks are the automated checks.
