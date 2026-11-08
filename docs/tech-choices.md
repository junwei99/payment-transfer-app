# Technology choices

## Linting

Use [Expo's flat ESLint preset](https://docs.expo.dev/guides/using-eslint/) for the React Native app. Its config lives in `eslint.config.mjs` and imports `eslint-config-expo/flat.js`. ESLint 9 satisfies the preset plugins' peer dependency ranges. Run the check with `pnpm lint`.

## UI components

Use [Uniwind](https://docs.uniwind.dev/quickstart) with Tailwind CSS 4 to style the payment transfer screens. Build the interface from React Native components such as `View`, `Text`, `TextInput`, and `Pressable`. Add small shared components for repeated elements such as form fields, buttons, and error messages.

Configure Uniwind in `metro.config.mjs`. The ESM file extends Expo's Metro config and points Uniwind to `src/global.css` and `src/uniwind-types.d.ts`.

The app targets iOS and Android with the same minimal visual style. The [assessment](../requirements.md) calls for a recipient, amount, optional note, balance display, clear errors, and a transfer confirmation screen. Uniwind lets these screens share Tailwind utility classes and theme values while keeping their components specific to the transfer flow.

The starter project includes [`@expo/ui`](https://docs.expo.dev/versions/v58.0.0/sdk/ui/). It provides native SwiftUI and Jetpack Compose controls. Use it for a specific native control if the flow needs one. The transfer screens use React Native components styled with Uniwind.

## State management

Use [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview) for data exposed by the simulated API. Query the account balance and, if implemented, transfer history. Process a transfer with a mutation, then refresh the affected queries after success. The simulated service owns the balance and transaction records; the Query cache reflects that service's results.

Keep the recipient, amount, note, validation messages, and biometric prompt state local to the transfer flow with React state. The confirmation screen reads the completed transaction by ID. Do not store biometric authentication results in the Query cache.

Do not add Zustand by default. If a concrete need for shared client state appears across unrelated screens and local state or a small context becomes awkward, explain that use case and ask before adding Zustand. The current transfer flow does not require it.
