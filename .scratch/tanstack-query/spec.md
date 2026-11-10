# Client API integration

Status: ready-for-human

## Objective

Replace the legacy client mock gateway with TanStack Query and the existing
bankingService, preserving the current screens and transfer journey. Follow the
[execution plan](plan.md). This scope was agreed through a planning discussion;
implementation is complete; manual device acceptance remains pending.

## Agreed scope

- Keep services/mock-api as the backend and preserve the Axios/Zod API boundary.
- The requestor returns validated data directly and throws a shared ServiceError
  for expected API, parsing, and transport failures, preserving their details.
  Unexpected programming/configuration errors propagate unchanged. This supersedes
  the original Query-level unwrap adapter; retry and transfer recovery rules stay
  with their existing owners.
- Fetch account, recipients, and completed transfers through Query. Use mutations
  for transfer approval and submission.
- Originally kept form, review, validation, simulated authentication, and
  unresolved submission state in React state/context. This decision is superseded
  by the approved [Zustand split](../zustand-transfer/spec.md); Query continues
  to own API data and mutations.
- Keep one clearly labelled simulated authentication action, followed by actual
  approval and submission API calls. Real biometrics are a separate task.
- Remove client fixtures, example field defaults, scripted scenarios, fake
  receipts, and runtime fallback responses. Keep truthful simulation wording.
- Show loading, empty, validation, error, and retry states. Never simulate success
  or optimistically deduct the balance.
- Preserve the original request and idempotency key for uncertain submissions
  while the app remains open. Block editing and new transfers until resolved.
- No automated tests or test framework additions. Developer verification is
  manual, with formatting, lint, and TypeScript checks still required.

## Exclusions and limitations

No secure storage, restart recovery, persisted Query cache, transfer history,
contacts integration, or visual redesign. Earlier proposals for persistent
recovery were explicitly withdrawn to keep this project scope small.

Closing the app loses unresolved-submission recovery information. A fresh balance
does not prove that a particular transfer succeeded. Document this limitation in
the project README during implementation.

Real device biometrics and fallback handling remain required by
[the product requirements](../../docs/requirements.md), but are deferred from this task.

## References

- [Technology choices](../../docs/tech-choices.md)
- [Domain vocabulary](../../GLOSSARY.md)
- [POST API contract](../../docs/adr/0001-post-only-body-api.md)
- [Existing API layer plan](../api-requestor/plan.md)
