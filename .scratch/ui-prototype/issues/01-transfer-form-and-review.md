# 01: Transfer form and review

**What to build:** A Japanese Fresh transfer form where the user sees a fictional MYR balance, selects or enters a recipient, enters an amount and optional note, and reviews those details before continuing. Establish the disposable in-memory mock boundary as part of this usable journey.

**Blocked by:** None (can start immediately).

**Status:** ready-for-human

## First step: grilling round

Read the parent spec, plan, mobile styling guide, and existing implementation. Inspect facts independently, then ask the user a focused round about unresolved form layout, recipient fields, example values, and review presentation. Wait for answers before coding; record agreed decisions. This ticket requires interactive participation despite its ready-for-agent status. Preserve the scope already agreed.

## Acceptance criteria

- [x] The initial grilling round is complete and its decisions are recorded.
- [x] The transfer entry and review screens use the installed Uniwind/Tailwind 4 stack and the shared mobile styling guide, with light appearance and fictional branding.
- [x] A fixed fictional MYR balance and small fictional Malaysian recipient list appear through one replaceable asynchronous in-memory mock interface.
- [x] Users can select a recipient or enter one manually, edit an amount, and add an optional note using local presentation state.
- [x] Review reflects entered details; returning to the form preserves them. Empty fields use clearly indicated example values for the demonstration.
- [x] Fixtures and mock behavior remain isolated from screen components. There are no HTTP requests, financial calculations, balance changes, persistence, or validation engine.
- [ ] The form accommodates safe areas, scrolling, keyboard visibility, scalable text, and accessible labels. The user performs manual verification.
- [x] The existing starter TypeScript ref mismatch recorded in the plan is resolved if the affected component remains; files are not excluded to hide the error.
- [x] Run `pnpm exec expo lint` and `pnpm exec tsc --noEmit`; report results. Write no unit tests or other automated tests. Manual UI verification remains the user's responsibility.

## Context

Follow the parent UI prototype spec and plan and the project's mobile styling guide. Authentication and confirmation are delivered by ticket 02; do not present a nonfunctional continuation as a completed transfer.

## Comments

### Agreed decisions — 2026-11-08

- Replace the starter UI completely; keep implementation minimal and limited to requirements. No extra steps, features, or unnecessary interaction behavior.
- One scrollable form and a separate review screen, with preserved values on return.
- Three fictional recipients in an inline picker; manual entry takes name and account number.
- Mock-provided balance MYR 5,000.00; empty-field examples Aina Rahman, 1234567890, and MYR 120.00. Initially empty inputs; persistent hints identify defaults, and review states which examples were used. Empty notes remain absent.
- Review shows amount, recipient, full fictional account number, and any note, with Edit details. Clearly identify prototype and fictional data.
- User confirmed all ticket 01 decisions before coding.

### Implementation result

Form and review implemented. Starter screens and their unused components removed, including the web ref mismatch. `pnpm exec expo lint` and `pnpm exec tsc --noEmit` both passed. No automated tests were written or run. Status is ready-for-human for manual iOS/Android acceptance; layout, keyboard, text scaling, and accessibility verification remain pending.
