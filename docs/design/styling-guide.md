# Japanese Fresh mobile styling guide

Adapted from the Japanese Fresh style reference (`/styles/japanese-fresh`) for this project's Uniwind and Tailwind CSS 4 interface. This is the visual reference for the payment transfer prototype. See [technology choices](../tech-choices.md) and [requirements](../requirements.md).

## Direction

Use rice-white surfaces, generous breathing room, soft corners, delicate botanical accents, and quiet typography. Prioritize usable phone layouts over the original reference's desktop-scale whitespace. The prototype uses a light theme even when the device uses dark mode.

The owner's visual feedback asked for more of the Japanese wabi-sabi character. Express it through an asymmetric botanical drawing with gently irregular contours, warm paper surfaces, sage selection states, and restrained serif headings. Keep the transfer form visually primary; prototype tools belong beneath it. Avoid adding decorative interface steps.

Readability and accessible interaction take precedence over decorative rules. Preserve meaningful uppercase identifiers such as MYR; use sentence case for interface copy. Use restrained fictional branding, without implying this is an official bank application.

## Uniwind and Tailwind 4

Keep the existing Uniwind Metro integration and CSS entry point. Use React Native primitives styled through `className`; apply text classes to `Text` and `TextInput` explicitly rather than relying on web-style inheritance. Use complete, statically discoverable utility names.

Define shared design tokens through Tailwind 4's CSS-first theme facilities, using semantic color names such as canvas, surface, ink, secondary, accent, and divider. Use `--color-*` theme variables to expose color utilities. This guide describes future implementation; it does not require changing the CSS during planning.

Use flex layouts, scrollable phone content, safe-area spacing, and keyboard-aware forms. Browser HTML, CSS grids, hover-only behavior, outline utilities, and desktop navigation templates are not implementation patterns for this app. Check native utility support before adopting a web utility; use a small native style where needed. Do not add NativeWind or a Tailwind 3 configuration.

References: [Uniwind quickstart](https://docs.uniwind.dev/quickstart), [Tailwind theme variables](https://tailwindcss.com/docs/theme), [Uniwind theme configuration](https://docs.uniwind.dev/theming/custom-themes). Consult the installed version before adopting newer documentation features.

## Palette

| Role      | Value     | Use                                            |
| --------- | --------- | ---------------------------------------------- |
| Canvas    | `#fafaf8` | Screen background                              |
| Surface   | `#ffffff` | Occasional grouped content                     |
| Ink       | `#4a5568` | Main text and labels                           |
| Secondary | `#596779` | Supporting readable text                       |
| Sky       | `#64b5f6` | Decorative accent                              |
| Mint      | `#98d8c8` | Success decoration                             |
| Pink      | `#ffb7c5` | Error decoration                               |
| Powder    | `#b8d4e3` | Quiet accent surfaces                          |
| Divider   | `#d4d4cf` | Decorative separation                          |
| Muted     | `#b0b8c4` | Nonessential decoration only                   |
| Paper     | `#f2efe7` | Warm balance surface and prototype selection   |
| Sage      | `#e4e8dc` | Recipient selection and quiet success surfaces |
| Clay      | `#b99b85` | Small decorative rules and botanical accents   |

Use dark readable text on pastel buttons and surfaces; avoid white text on pale sky blue. The original secondary/muted colors are not defaults for essential small text. Verify text contrast on the actual background: at least 4.5:1 for normal text, 3:1 for large text. Essential control boundaries and focus indicators need sufficient contrast; pale decorative dividers must not be the only way to identify an input or state. Error and success states include explicit words or icons, not color alone.

## Typography and spacing

Use platform serif fonts for display headings and amounts: Georgia on iOS, the system serif on Android, and Georgia with a serif fallback on web. Keep body text, labels, and controls in the platform's default sans serif. Use regular weights; avoid semibold/bold visual emphasis. Respect font scaling and allow content to wrap. This refinement follows the owner's feedback on the initial all-sans-serif prototype and requires no bundled font or download.

| Element                   | Starting point                                    |
| ------------------------- | ------------------------------------------------- |
| Screen title              | 32–36 logical units, regular serif                |
| Section title             | 20–24, regular serif                              |
| Balance / transfer amount | 36, regular serif; currency in smaller sans serif |
| Body and inputs           | 16, regular                                       |
| Supporting text           | 14, regular                                       |
| Screen horizontal padding | 20–24 (`px-5` / `px-6`)                           |
| Major section separation  | 24–40 (`gap-6` through `gap-10`)                  |
| Related item separation   | 8–16                                              |
| Surface padding           | 16–24                                             |
| Control hit area          | At least 48 by 48 logical units                   |

These are starting values to assess on device, not fixed heights that may clip text. Keep the main action reachable when the keyboard opens. Tablet layouts may center a constrained form; desktop layouts are not a prototype target. Do not carry over `py-32` section padding onto phones.

## Components

- Buttons: soft corners (`rounded-lg`), readable labels, generous hit area, immediate pressed feedback, and an obvious disabled/busy state. Style the container and label separately. Pastel fills may carry dark text.
- Surfaces: white, `rounded-xl`, optional thin warm divider, no shadow or elevation. Use whitespace instead of nested cards.
- Inputs: bottom border, transparent background, and a persistent visible label. A floating label may move between resting and editing positions but never disappear or depend solely on a placeholder. Focus changes must remain visible. Allow error copy below the field without clipping.
- Recipient rows: clear name and account identifier, delicate dividers, and a sage selected surface with a filled radio marker plus accessible selected state. Keep selection distinct from entering a recipient manually.
- Balance and transfer details: readable amount, currency, recipient, optional note, and clear hierarchy. Confirmation uses fictional reference/date details from the mock result.
- Botanical artwork: one restrained, asymmetric line drawing in the shared screen header. The local `assets/images/botanical-branch.svg` uses simple curves and quiet paper/sage fills, rendered through the installed Expo Image package. Keep it decorative and hidden from accessibility navigation. Paper texture is optional and must not reduce legibility.
- Scenario controls: clearly marked as prototype tools, visually secondary to the transfer journey.

## Motion and interaction

Provide immediate touch feedback. Optional decorative transitions may be gentle (roughly 300–500ms), but must never delay actions. Avoid bounce, scaling, hover floats, and heavy effects. Respect the device's reduced-motion preference and retain clear static status feedback. Loading is accompanied by text.

Use thin borders (up to one logical unit); subtle decorative opacity belongs on the border color, not the whole component. Avoid shadows, neon colors, gradients, glass effects, dark backgrounds, and decorative uppercase headings. Accessible focus indication may override decorative border restraint.

## Manual review checklist

The user owns visual and interaction verification on iOS and Android:

- Small screens, keyboard visibility, safe areas, larger text, and scrolling remain usable.
- Labels, focus/pressed/selected/error/busy states, and screen-reader descriptions are clear.
- Essential text and controls have adequate contrast; color alone carries no state.
- Light appearance, restrained decoration, rounded shapes, and generous spacing remain consistent.
- Reduced motion preserves status changes and navigation clarity.

Agents run lint and TypeScript checks only. No unit tests are required for this prototype.
