# Mock transfer API

A standalone Bun TypeScript service for local development and assessment demos.
It owns a shared demo account, recipients, transfer approvals, and completed
transfers in memory. The mobile app uses TanStack Query and the Axios/Zod client
to read this service and submit transfers.

## Run

Use Bun 1.2.11 or later. From the repository root:

```sh
cd services/mock-api
bun install --frozen-lockfile
bun run dev
```

`bun run start` runs without watching files. `bun run typecheck` checks this
service independently of Expo. There are no runtime dependencies or automated
tests. Developers verify behavior manually using the examples below.

The default address is `0.0.0.0:3001`. Override it with `HOST` and `PORT`:

```sh
HOST=127.0.0.1 PORT=4001 bun run start
```

All devices share one account, initially MYR 5,000 (`balanceMinor: 500000`).
Restarting, a source change in watch mode, or a reset discards all runtime state.
The developer control endpoints are unauthenticated and intended for this local
demo service.

## API contract

All eight endpoints use POST. Reads, health, and reset require `{}` bodies;
lookup requires `{ "id": "TRANSFER_ID" }`. GET/PUT aliases are removed.
Send JSON bodies with `Content-Type: application/json`. Responses are JSON with
`Cache-Control: no-store`. Currency is `MYR`, money uses integer minor units
(sen), and timestamps are ISO UTC strings. Unknown request fields are rejected.

| Method | Path                       | Response                                                          |
| ------ | -------------------------- | ----------------------------------------------------------------- |
| POST   | `/health`                  | `200` with `{ "status": "ok" }`                                   |
| POST   | `/account`                 | `200` with `id`, `balanceMinor`, and `currency`                   |
| POST   | `/recipients`              | `200` with an array of `{ id, name, account }`                    |
| POST   | `/transfer-authorizations` | `201` with `approvalId` and `expiresAt`                           |
| POST   | `/transfers`               | `201` with the completed transfer; `200` for an idempotent replay |
| POST   | `/transfers/lookup`        | `200` with the completed transfer                                 |
| POST   | `/__mock/reset`            | `200` with restored `account` and default `config`                |
| POST   | `/__mock/config`           | `200` with the resulting config; accepts partial updates          |

Authorization requests contain these transfer details:

```json
{
  "recipient": { "name": "Aina Rahman", "account": "1234567890" },
  "amountMinor": 12000,
  "currency": "MYR",
  "note": "Lunch"
}
```

`recipient.name` must be nonblank. `recipient.account` must contain exactly ten
digits and remains a string to preserve leading zeros. Names and account numbers
are trimmed. `amountMinor` must be a positive safe integer, and `note` is optional
with a maximum of 200 characters. An omitted note becomes an empty string.
Recipients can be entered manually and do not have to match a seeded contact.

Submission requests contain the same details plus `approvalId` and a required
`idempotencyKey` body field of 1–200 nonblank characters. A successful response has
the transfer details plus `id`, `reference`, `status: "completed"`, and `createdAt`.

The authorization endpoint simulates the backend's decision after device
authentication. It accepts transfer details, without biometric data, a device
passcode, or scenario flags. This service does not implement cryptographic
verification of device authentication or app login.

Approvals expire after five minutes and bind to the normalized recipient,
amount, currency, and note. A successful submission consumes its approval.
Failed submissions do not consume it. Balance is checked at submission, and
deduction and record creation happen synchronously together.

Retry an uncertain submission using the **same key and body**, including its
approval ID. A completed request is replayed even if that approval was consumed
or has since expired. Changing the body under a completed key returns `409`.
Keys for failed submissions are not reserved. All replay records last until
reset or restart. Concurrent identical successful submissions debit only once.

Response delays happen after processing. Closing the app or timing out a
request does not undo a completed transfer. A delayed approval's five-minute
lifetime starts when it is created, not when its response reaches the client.
Ordinary API responses default to a one-second delay so the app's loading states
are visible. Health and developer control endpoints remain immediate. The
developer config endpoint can change the delay, and reset restores one second.

## Manual happy path

In another terminal, set the base address and inspect the fixtures:

```sh
API=http://localhost:3001
curl -i -X POST "$API/health" -H 'Content-Type: application/json' -d '{}'
curl -i -X POST "$API/__mock/reset" -H 'Content-Type: application/json' -d '{}'
curl -i -X POST "$API/account" -H 'Content-Type: application/json' -d '{}'
curl -i -X POST "$API/recipients" -H 'Content-Type: application/json' -d '{}'
```

Request approval for MYR 120:

```sh
curl -i "$API/transfer-authorizations" \
  -H 'Content-Type: application/json' \
  -d '{"recipient":{"name":"Aina Rahman","account":"1234567890"},"amountMinor":12000,"currency":"MYR","note":"Lunch"}'
```

Copy `approvalId` from the response into the following body:

```sh
curl -i "$API/transfers" \
  -H 'Content-Type: application/json' \
  -d '{"approvalId":"REPLACE_WITH_APPROVAL_ID","idempotencyKey":"manual-transfer-1","recipient":{"name":"Aina Rahman","account":"1234567890"},"amountMinor":12000,"currency":"MYR","note":"Lunch"}'
```

Expect `201` with a completed transfer. Run the identical submission command
again: expect `200` with the same transfer ID, reference, and timestamp.

```sh
curl -i -X POST "$API/account" -H 'Content-Type: application/json' -d '{}'
curl -i -X POST "$API/transfers/lookup" -H 'Content-Type: application/json' -d '{"id":"REPLACE_WITH_TRANSFER_ID"}'
```

The balance should be `488000` after both submissions, and retrieval should
match the submission response. Reuse `manual-transfer-1` with a changed amount
to verify `409 IDEMPOTENCY_CONFLICT`. Reuse the consumed approval with a new key
to verify `409 APPROVAL_CONSUMED`.

## Manual errors and approvals

An invalid amount returns `400 VALIDATION_ERROR` without changing the balance:

```sh
curl -i "$API/transfer-authorizations" \
  -H 'Content-Type: application/json' \
  -d '{"recipient":{"name":"Aina Rahman","account":"1234567890"},"amountMinor":0,"currency":"MYR"}'
```

Also try a blank name, a nine-digit account, a fractional amount, another
currency, an oversized note, and an unexpected field. Malformed JSON returns
`400 INVALID_JSON`; a non-JSON content type returns `415 UNSUPPORTED_MEDIA_TYPE`.

For real insufficient funds, approve a valid transfer of `500001` minor units
after reset, then submit it. Approval succeeds, but submission returns
`422 INSUFFICIENT_FUNDS`. Check that the balance remains `500000`.

For approval enforcement, try submitting with an unknown approval ID; change
the note or amount after approval; or wait five minutes before using a fresh
approval. Expect `APPROVAL_INVALID` or `APPROVAL_MISMATCH` with no deduction.

## Scripted scenarios

Configure scenarios through developer endpoints, leaving normal API requests
unchanged. A config update changes only supplied fields. Settings affect every
device using this service.

```sh
curl -i -X POST "$API/__mock/config" \
  -H 'Content-Type: application/json' \
  -d '{"approvalOutcome":"cancelled"}'
```

Repeat the authorization request to see `403 AUTHENTICATION_CANCELLED`. Choose
`unavailable` for `503 AUTHENTICATION_UNAVAILABLE`, `rejected` for
`403 AUTHENTICATION_REJECTED`, and `approved` to restore approval success.
These outcomes continue until reconfigured or reset; they do not consume a
one-time attempt.

```sh
curl -i -X POST "$API/__mock/config" \
  -H 'Content-Type: application/json' \
  -d '{"approvalOutcome":"approved","transferOutcome":"insufficient-funds"}'
```

Approve a valid affordable transfer and submit it: expect
`422 INSUFFICIENT_FUNDS` with no deduction, regardless of the actual balance.

```sh
curl -i -X POST "$API/__mock/config" \
  -H 'Content-Type: application/json' \
  -d '{"transferOutcome":"fail-once"}'
```

Obtain a fresh approval and submit using a fresh key. The first otherwise valid,
affordable submission returns `503 TRANSFER_UNAVAILABLE`. Retrying with the same
body and key completes it. Later attempts behave normally. Setting
`transferOutcome` again rearms this failure; updating only the delay does not.
Invalid approvals and insufficient funds do not consume the failure attempt.

```sh
curl -i -X POST "$API/__mock/config" \
  -H 'Content-Type: application/json' \
  -d '{"transferOutcome":"normal","responseDelayMs":3000}'
```

Ordinary API responses, including errors, now take an extra three seconds.
Health and developer control endpoints remain immediate. Delays must be an
integer from `0` to `30000` milliseconds. To inspect a timeout, submit a fresh
approved transfer with `curl --max-time 1`, restore delay to zero through the
control endpoint, then retry the same submission and key. The transfer should
already exist, and the retry returns it without another deduction.

```sh
curl -i -X POST "$API/__mock/reset" -H 'Content-Type: application/json' -d '{}'
```

Reset restores balance and default config, and clears completed transfers,
approvals, and idempotency records. Retrieval of an old transfer now returns
`404 TRANSFER_NOT_FOUND`. Reset while no requests are in flight: already
processed delayed requests can still deliver their earlier responses.

## Error contract

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "The available balance is insufficient."
  }
}
```

| HTTP status | Codes                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------- |
| 400         | `VALIDATION_ERROR`, `INVALID_JSON`                                                             |
| 403         | `AUTHENTICATION_CANCELLED`, `AUTHENTICATION_REJECTED`, `APPROVAL_INVALID`, `APPROVAL_MISMATCH` |
| 404         | `NOT_FOUND`, `TRANSFER_NOT_FOUND`                                                              |
| 405         | `METHOD_NOT_ALLOWED` (includes the `Allow` header)                                             |
| 409         | `IDEMPOTENCY_CONFLICT`, `APPROVAL_CONSUMED`                                                    |
| 415         | `UNSUPPORTED_MEDIA_TYPE`                                                                       |
| 422         | `INSUFFICIENT_FUNDS`                                                                           |
| 500         | `INTERNAL_ERROR`, `REQUEST_FAILED`                                                             |
| 503         | `AUTHENTICATION_UNAVAILABLE`, `TRANSFER_UNAVAILABLE`                                           |

Scripted service failures return HTTP responses. To verify an actual connection
failure, stop the service or use an unreachable address.

## Connecting a mobile device

Use `http://localhost:3001` from the iOS simulator on this Mac,
`http://10.0.2.2:3001` from the standard Android emulator, or
`http://<developer-machine-LAN-IP>:3001` from a physical device on the same
network. Use the default `0.0.0.0` binding for emulator and LAN connections.
Expo's Metro address or tunnel does not forward this separate service.

Set `EXPO_PUBLIC_API_URL` in the root `.env.local`; see the root README.
The screens use the API through TanStack Query; authentication remains simulated.

## Runtime references

The implementation uses Bun's [HTTP server](https://bun.sh/docs/runtime/http/server)
and isolated [TypeScript definitions](https://bun.sh/docs/typescript).
