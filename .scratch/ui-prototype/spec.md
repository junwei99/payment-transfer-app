# Payment transfer UI prototype

Status: ready-for-human

## Problem Statement

The project owner needs to see and evaluate the payment transfer app before investing in services, security integration, and financial rules. The existing starter does not show the intended transfer experience or the Japanese Fresh visual direction.

## Solution

Create a mobile prototype with an editable transfer form, review, simulated authentication, processing, and confirmation. A disposable in-memory mock system supplies fictional MYR data and explicitly selected outcomes. Include recovery and fallback screens so the owner can inspect the experience without real transfers or device authentication.

## User Stories

1. As a prototype reviewer, I want a coherent light visual style, so that I can assess the intended appearance.
2. As a prototype reviewer, I want readable phone layouts, so that I can assess everyday usability.
3. As a sender, I want to see an example account balance, so that I understand the form's context.
4. As a sender, I want to choose a fictional recipient, so that I can preview recipient selection.
5. As a sender, I want to enter a recipient manually, so that I can preview a transfer to someone new.
6. As a sender, I want to enter an amount in MYR, so that I can preview my intended transfer.
7. As a sender, I want to add an optional note, so that I can see how it appears in transfer details.
8. As a sender, I want to review my entered details, so that I can inspect them before continuing.
9. As a sender, I want to return from review to editing, so that I can adjust my details.
10. As a prototype reviewer, I want empty fields to use indicated example values, so that I can demo the flow without completing every field.
11. As a prototype reviewer, I want to preview biometric authentication, so that I can assess its place in the journey.
12. As a prototype reviewer, I want an authentication cancellation scenario, so that I can assess recovery.
13. As a prototype reviewer, I want an unavailable-biometrics scenario, so that I can inspect fallback guidance.
14. As a prototype reviewer, I want a simulated passcode fallback, so that I can inspect that path without entering credentials.
15. As a sender, I want a processing state, so that I understand that the transfer is pending.
16. As a sender, I want confirmation with transfer details, so that I understand the successful outcome.
17. As a prototype reviewer, I want scripted input errors, so that I can assess field feedback without a validation engine.
18. As a prototype reviewer, I want an insufficient-funds scenario, so that I can inspect its messaging.
19. As a prototype reviewer, I want a network-failure scenario, so that I can inspect retry behavior.
20. As a sender, I want to return to editing after failure, so that I can continue the journey.
21. As a prototype reviewer, I want to select scenarios before starting, so that demonstrations are repeatable.
22. As a prototype reviewer, I want to reset the demo, so that previous presentation state does not affect the next review.
23. As a prototype reviewer, I want keyboard-aware layouts and scalable text, so that I can evaluate the app on different phones.
24. As a prototype reviewer, I want accessible labels and reduced motion, so that I can assess inclusive presentation.
25. As a maintainer, I want to replace one mock interface implementation, so that the prototype does not embed disposable fixture behavior throughout the UI.

## Implementation Decisions

- Use the installed Uniwind and Tailwind CSS 4 stack with React Native primitives and Expo Router. Keep reusable presentation components outside route modules. Follow the shared mobile styling guide.
- Use light appearance regardless of device theme, readable body weights and contrast, practical phone spacing, and immediate pressed feedback.
- Journey: transfer form, review, simulated authentication, processing, confirmation. Provide failure recovery and return-to-edit paths.
- Keep entered recipient, amount, and note in local presentation state and reflect them in review and confirmation. Allow simple display formatting and visibly indicated defaults for empty fields. Do not infer financial validity.
- Use fictional Malaysian recipients, MYR, and a fixed example balance. Confirmation metadata is fictional. Do not imply official bank branding.
- Provide one small replaceable asynchronous interface for balance, recipients, and scripted transfer results. Keep fixtures and scenario machinery behind it. No HTTP requests or mock server.
- Simulate optional processing delay. The mock does not calculate balance, validate transfers, persist records, or perform authentication. The balance remains fixed after success.
- Keep authentication simulation visibly marked. Unavailable biometrics offers simulated device-passcode success/cancellation actions; never collect a passcode or invoke the device security APIs.
- Provide prototype-only scenario selection before the flow: success, input error, insufficient funds, network failure, authentication cancellation, and unavailable biometrics. Place each scripted result at its relevant journey step.
- Retry is governed by the chosen scripted scenario, not random behavior. Reset restores a documented initial fixture state and clears entered values, transient errors, and pending demo work. Determine exact retry sequencing in the affected ticket's initial grilling round.
- Begin every implementation ticket with a focused grilling round on unresolved UI details. Resolve those decisions with the user before coding. This is an interactive execution prerequisite despite the tracker's ready-for-agent status.
- Production data integration remains separate work. This prototype does not implement the full assessment's service, security, or financial requirements.

## Testing Decisions

- The user performs all manual UI and journey verification on iOS and Android.
- Agents run only lint and TypeScript checks. No unit tests, integration tests, or automated UI tests are to be written for this prototype.
- The manual verification boundary is the complete visible journey: details carry through review and confirmation, selected scenarios show the intended state, and retry/reset/navigation behave coherently.
- Inspect appearance, keyboard handling, safe areas, text scaling, accessibility labels, contrast, and reduced motion manually. These are acceptance expectations, not claims of automated coverage.
- There is no existing automated transfer-test suite to extend. Do not create a new test seam or framework.

## Out of Scope

Real API calls, HTTP mocking infrastructure, persistent storage, financial calculations, balance mutation, transaction eligibility, complex or production validation, actual biometrics/passcode collection, device contacts, transfer history, dark mode, desktop-specific design, and production security behavior. No application implementation occurs in the planning session.

## Further Notes

The existing technology choices describe the eventual simulated service and query-cache approach. This disposable visual prototype intentionally stops short of implementing that service architecture. Do not add dependencies merely to simulate asynchronous fixtures.

Ticket granularity and dependency edges must be approved before publishing the implementation tickets. The user owns manual verification; lint/type success must not be presented as proof that the UI has been visually verified.
