# Use POST and JSON bodies for the mock API

The client requestor will expose a body-only request contract. All mock-service
endpoints, including reads, health, and developer controls, will use POST so the
requestor does not need separate path, query, or endpoint-header input contracts.
Transfer lookup moves to /transfers/lookup, and idempotencyKey moves into the
submission body while retaining existing replay semantics. This intentionally
replaces conventional GET reads and the Idempotency-Key header; existing consumers
and service examples must migrate together. Implementation is planned in
[the API layer plan](../../.scratch/api-requestor/plan.md).
