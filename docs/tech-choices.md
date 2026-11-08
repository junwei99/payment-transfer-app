# Technology choices

## Linting

Use [Expo's flat ESLint preset](https://docs.expo.dev/guides/using-eslint/) for the React Native app. Its config lives in `eslint.config.mjs` and imports `eslint-config-expo/flat.js`. ESLint 9 satisfies the preset plugins' peer dependency ranges. Run the check with `pnpm lint`.

## File organization

Follow [ADR-0002](adr/0002-shared-code-lives-in-category-folders.md) when adding,
moving, or naming application files. Screen-specific components live under
`src/screens/<screen>/components/`; shared UI is grouped by purpose under
`src/components/`. Use PascalCase `.tsx` filenames outside the route directory.

## UI components

Use [Uniwind](https://docs.uniwind.dev/quickstart) with Tailwind CSS 4 to style the payment transfer screens. Build the interface from React Native components such as `View`, `Text`, `TextInput`, and `Pressable`. Add small shared components for repeated elements such as form fields, buttons, and error messages.

Configure Uniwind in `metro.config.mjs`. The ESM file extends Expo's Metro config and points Uniwind to `src/global.css` and `src/uniwind-types.d.ts`.

The app targets iOS and Android with the same minimal visual style. The [assessment](requirements.md) calls for a recipient, amount, optional note, balance display, clear errors, and a transfer confirmation screen. Uniwind lets these screens share Tailwind utility classes and theme values while keeping their components specific to the transfer flow.

The starter project includes [`@expo/ui`](https://docs.expo.dev/versions/v58.0.0/sdk/ui/). It provides native SwiftUI and Jetpack Compose controls. Use it for a specific native control if the flow needs one. The transfer screens use React Native components styled with Uniwind.

For transfer UI appearance and component states, follow the [mobile styling guide](design/styling-guide.md). The disposable UI prototype uses local presentation state and scripted in-memory responses; the service architecture below applies to later functional implementation.

## Schema validation

The standalone local [mock API service](../services/mock-api/README.md) uses
direct TypeScript request checks without Zod, as explicitly chosen for its
small simulation scope. The following response-validation decision applies
to the mobile client's later API integration.

Use Zod to define schemas and validate all external responses, including backend API responses. Parse responses at the service boundary before returning data to the app or storing it in the Query cache. Treat responses that fail validation as service errors and surface them through the flow's error handling.

Infer TypeScript types from the schemas so runtime validation and response types stay in sync.

## State management

Use [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview) for data exposed by the simulated API. Query the account balance and, if implemented, transfer history. Process a transfer with a mutation, then refresh the affected queries after success. The simulated service owns the balance and transaction records; the Query cache reflects that service's results.

Use Zustand for shared transfer client state: the recipient, amount, note,
validation messages, reviewed snapshot, completion ID, pending status, and
unresolved submission. Screens select only the fields they need from
`src/stores/transfer.ts`. Store modules live in `src/stores/`, following the
shared category-folder convention.

Screens read API data directly through TanStack Query hooks. Do not mirror query
results in Zustand. Transfer orchestration hooks in `src/hooks/use-transfer.ts`
read the Query cache when reviewing and use mutations for approval/submission,
then seed the receipt cache and invalidate the account after success.

The transfer context previously combined query results with client state and
subscribed every consumer to all changes. Zustand separates those responsibilities
and allows field-level subscriptions. This focused migration was explicitly
approved; Query and navigation theme providers remain in place.

State remains in memory across navigation. Synchronous store writes block rapid
taps across hook instances. An uncertain submission retains its exact body and
idempotency key and blocks editing/reset until resolved. Recovery never requests
fresh approval or generates a new key. Closing the app loses recovery information.
Do not store biometric authentication results in the Query cache.

## API boundary

Use Axios through `src/utils/requestor.utils.ts` and Zod endpoint schemas under
`src/schemas/apis/`. Registration requires body, success, and error schemas;
request types use `z.input`, response types use `z.output`. Outgoing bodies are
sent unchanged without runtime request parsing. Parse every response before
returning a discriminated result; ordinary Zod objects strip extra fields.
Declare banking services in the client; health and developer controls remain server-only.

Follow [ADR-0001](adr/0001-post-only-body-api.md): all eight mock endpoints use
POST JSON bodies. Transfer lookup uses `/transfers/lookup` and submission carries
`idempotencyKey` in its body. Configure `EXPO_PUBLIC_API_URL` with no fallback.
The requestor defaults to 30 seconds, supports cancellation, and never retries.
Timeout/cancellation cannot establish whether a transfer committed. Query
integration must preserve the original submission body and key for recovery.

Follow the reference frontend's `API_SCHEMA` registry, per-endpoint
`request`/`successResponse`/`errResponse` schemas, inferred `TGetApiEndpoint*`
types, and `requestor.createRequest(endpoint)` declarations. Group callable
operations in `bankingService`. Keep the
agreed raw response bodies and discriminated result contract.
