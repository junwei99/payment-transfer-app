# Payment transfer UI prototype plan

Status: ticket breakdown approved; tickets published

## Agreed scope

Build an interactive, disposable-data prototype to review the payment transfer experience. Follow the [mobile styling guide](../../docs/design/styling-guide.md) and [spec](spec.md). This planning session changes documentation only.

Use the installed Uniwind/Tailwind 4 stack. Preserve the Japanese Fresh appearance with accessible mobile adaptations. Cover the required transfer journey, with fictional MYR data and a small recipient picker. Exclude contacts and history stretch goals.

## Approved delivery sequence

1. Transfer form and review: establish the styled entry flow, fixed balance and recipient fixtures, editable fields, and one replaceable asynchronous mock interface.
2. Successful transfer: connect review, simulated authentication, processing, and confirmation through the mock interface.
3. Scripted failure and fallback journeys: add the prototype scenario chooser, field errors, insufficient funds, network failure, authentication cancellation/unavailability, fallback actions, retry, and reset.

Every implementation ticket starts with a focused grilling round. Inspect facts first, ask the user about unresolved UI decisions for that slice, and wait for their answers before implementation. Do not reopen agreed scope without a concrete conflict. Tickets are interactive work, not unattended execution.

## Verification

The user manually verifies appearance and interactions on iOS and Android. Agents run only `pnpm exec expo lint` and `pnpm exec tsc --noEmit`. Write no unit tests or other automated UI tests. Report manual verification as pending unless the user has supplied results.

## Mock removal

Keep fixtures, scenario selection, delay controls, and scripted outcomes together behind one replaceable interface. Screens depend on presentation inputs/results rather than fixture imports. Later integration replaces the implementation and removes prototype controls; production security, validation, and transaction behavior will require separate work.

## Baseline checks (planning session)

- `pnpm exec expo lint`: passed.
- `pnpm exec tsc --noEmit`: fails in existing `src/components/app-tabs.web.tsx:38` with TS2322, a forwarded ref type mismatch. No application code was changed in this session. Resolve this baseline in the first implementation slice if the starter component remains; do not hide it by excluding files from type checking.

## Published tickets

- [01: Transfer form and review](issues/01-transfer-form-and-review.md)
- [02: Successful transfer journey](issues/02-successful-transfer-journey.md)
- [03: Failure and fallback journeys](issues/03-failure-and-fallback-journeys.md)

The user approved this breakdown and dependency order. Tickets 01, 02, and 03 are implemented; manual iOS/Android verification is pending. Ticket 03 records the scenario, retry, fallback, and reset decisions from the resumed session.

## Execution constraint — 2026-11-08

The owner confirmed a minimal implementation: replace all starter UI, implement the stated requirements directly, and add no extra features, steps, or unnecessary UI behavior. Example values must come from the mock data boundary.

## Visual refinement — 2026-11-08

The owner found the initial implementation too minimal and missing the Japanese wabi-sabi feel. Refined the shared header with a local hand-drawn botanical SVG, platform serif display type, warm paper surfaces, sage selections, and delicate recipient dividers. Prototype scenario controls now sit below the main form and action; reset is a quiet footer action. Review/confirmation share the revised typography and receipt-style details surface. No journey steps or dependencies were added. The styling guide records these refinements. Manual appearance review on iOS and Android remains pending.
