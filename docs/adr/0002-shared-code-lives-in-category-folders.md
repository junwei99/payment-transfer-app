# Organize UI by screen ownership and shared purpose

## Decision

Components used by one screen live in `src/screens/<screen>/components/`.
Components used across screens live in `src/components/<purpose>/`: layout
components in `layout/`, transfer presentation in `transfer/`, and generic UI
primitives in `ui/`. Move a component into shared code when a second screen needs
it. Create directories only when they have files to hold.

Expo Router routes and navigation remain in `src/app/`. Screen component folders
live outside that directory so their files do not become routes.

Shared infrastructure keeps its category folders: hooks in `src/hooks/`, Query
integration in `src/query/`, stores in `src/stores/`, services in `src/services/`,
utilities in `src/utils/`, schemas in `src/schemas/`, and types in `src/types/`.

Use PascalCase filenames for `.tsx` files outside `src/app/`, matching the primary
component or provider export. Route filenames preserve their URL names and Expo
Router conventions, including `index.tsx` and `_layout.tsx`. Files without JSX
use `.ts`. Follow the [code of conduct](../code-of-conduct.md) for hook filenames.

## Rationale

The original decision placed application code in category folders and rejected
feature folders. As screens were split into components, the flat component folder
mixed screen-specific sections with shared UI. Grouping by screen ownership keeps
related UI together and makes reuse explicit, while category folders continue to
serve the shared infrastructure. This adds a placement decision for UI files but
avoids spreading all transfer infrastructure across new feature folders.
