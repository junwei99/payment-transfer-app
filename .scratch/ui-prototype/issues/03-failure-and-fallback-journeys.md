# 03: Failure and fallback journeys

**What to build:** Let the reviewer choose repeatable prototype scenarios before starting the transfer flow, inspect scripted errors and authentication fallback, retry or return to editing, and reset the demonstration.

**Blocked by:** 02: Successful transfer journey.

**Status:** ready-for-human

## First step: grilling round

Inspect the completed journey and parent spec. Ask a focused round about scenario chooser placement, error copy and placement, deterministic retry sequencing, cancellation destinations, and the reset default. Wait for answers before coding and record the decisions. This is interactive work; do not replace scripted outcomes with business rules.

## Acceptance criteria

- [x] The initial grilling round is complete and its decisions are recorded, including exact retry and reset behavior.
- [x] Clearly marked prototype controls select success, input error, insufficient funds, network failure, authentication cancellation, and unavailable biometrics before beginning the journey.
- [x] Each scenario presents its scripted result at the appropriate step; input errors do not depend on a validation engine, and insufficient funds does not depend on balance arithmetic.
- [x] Unavailable biometrics offers a visibly simulated device-passcode fallback with explicit simulate-success and simulate-cancellation actions. No credentials are collected or device security APIs invoked.
- [x] Failure and cancellation offer appropriate recovery or return-to-edit actions, preserving entered details where agreed.
- [x] Retry follows the documented scenario sequence deterministically, without random failures or real requests.
- [x] Reset restores the documented initial fixture state and clears entered details, errors, transient state, and pending demo work. Stale results cannot alter a reset journey.
- [x] Fixtures, scenario controls, delays, and scripted outcomes remain grouped behind the replaceable mock boundary; screen components do not import disposable fixture data directly.
- [ ] All scenario screens follow the mobile styling guide and provide explicit readable state feedback. The user performs manual iOS and Android verification.
- [x] Run `pnpm exec expo lint` and `pnpm exec tsc --noEmit`; report results. Write no unit tests or other automated tests. Manual UI verification remains the user's responsibility.

## Context

Follow the parent UI prototype spec and plan and the project's mobile styling guide. Preserve the scope exclusions: real services, real authentication, financial rules, contacts access, history, persistence, and dark-mode design remain separate work.

## Comments

### Decisions — 2026-11-08

The owner replied “1. okay go” to the proposed decision round. Proceeded with the recommended behavior:

- Compact prototype scenario controls on the form, with Success initially selected. Changing scenarios preserves the draft, clears feedback and snapshots, and restarts the selected script. Selecting the already active scenario does not restart it; Reset demo starts a fresh demonstration.
- The first Review attempt in Input error displays scripted recipient and amount messages beside those controls. The next Review succeeds whether or not values changed; this is not financial validation.
- Insufficient funds and Network failure appear after the existing one-second processing delay. Insufficient funds fails on every submission until the scenario changes or resets. Network failure fails once, then all subsequent submissions succeed.
- Authentication cancellation occurs on the first biometric attempt; later attempts succeed. No submission occurs on cancellation.
- Unavailable biometrics always offers simulated passcode fallback. Explicit passcode success proceeds to processing; explicit cancellation preserves details and leaves fallback actions available.
- Failures/cancellation preserve the draft and reviewed details, with retry, Back to review, and Edit details. Editing alone does not restart a script.
- Reset demo is available throughout the journey, including processing. It cancels pending work, clears all entered values, feedback, fallback state, and snapshots, restores Success and its initial script, and returns to the form. Done uses the same reset.

### Implementation result

All six scenarios use the replaceable in-memory gateway. Screens consume scenario labels/descriptions and typed results without importing fixture data. Reset and leaving authentication abort pending processing; obsolete results are ignored. No dependencies, real authentication, balance arithmetic, HTTP requests, persistence, or automated tests were added. Manual iOS/Android verification remains pending.

`pnpm exec expo lint` and `pnpm exec tsc --noEmit` both passed. Status is ready-for-human for manual acceptance.
