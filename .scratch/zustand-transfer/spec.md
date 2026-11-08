# Transfer client state split

Status: ready-for-human

Implementation complete; manual mobile acceptance remains pending.

## Agreed decision

Replace TransferContext with an in-memory Zustand store. Screens subscribe to
individual client-state fields and read API data directly through Query hooks.
Query retains ownership of account, recipients, completed transfers, and
approval/submission mutations. Orchestration hooks bridge Query and Zustand.
Keep QueryClientProvider and the navigation ThemeProvider.

This supersedes the React state/context restriction in the Query integration
spec and the previous state-management choice in docs/tech-choices.md.

## Behavior to preserve

- Draft and reviewed snapshot survive route changes; edits invalidate review.
- Validation and simulated authentication keep their current behavior.
- Synchronous shared pending state blocks duplicate taps across hook instances.
- Save the exact submission body/key before sending; uncertain outcomes retain
  them and block editing, reset, Back, and new transfers.
- Explicit recovery reuses that same body/key without new approval.
- Success seeds the receipt cache and refreshes the account independently.
- App closure loses recovery information. No persistence or restart recovery.

## Verification

Run Prettier, Expo lint, and TypeScript. Keep the existing manual mobile
acceptance checklist in ../tanstack-query/plan.md; no test framework additions.

## Verification record — 2026-11-08

Passed Prettier, `pnpm exec expo lint`, and `pnpm exec tsc --noEmit`.
Expo production exports for both iOS and Android passed with
`EXPO_PUBLIC_API_URL=http://localhost:3001`; output is outside the repository.
No device journeys or live API recovery scenarios were exercised. The manual
acceptance checklist in the Query plan remains pending. No test framework added.
