# Code of conduct

Apply to TypeScript and React Native code, including tests and mocks.

- Types: ban hard casts (`as Type`, `<Type>value`, double assertions), hidden casts, and type-error suppression. Allow `as const`. Use inference, annotations, `satisfies`, and runtime narrowing; validate external data at service boundaries. Fix incompatible types or reshape code.

- Naming: camelCase variables; UPPER_SNAKE_CASE fixed constants (limits/configuration); PascalCase components; `T`-prefixed PascalCase type aliases; `I`-prefixed PascalCase interfaces. Runtime `const` values use camelCase.

- Files: PascalCase component files; camelCase or kebab-case hook files starting with `use`; kebab-case other TypeScript files. Preserve framework, declaration, and configuration filenames, including `index.tsx`, `_layout.tsx`, `expo-env.d.ts`, and `tsconfig.json`. Route filenames follow URL names.

- Imports: use configured absolute aliases for all project-local imports, type imports, re-exports, and dynamic imports. Client source uses `@/…`; asset `require` calls use `@/assets/…`. Ban `./` and `../`; keep package names for package imports.

- Functions: use arrow functions for components, hooks, utilities, and callbacks; declare named arrows with `const`.

- Spacing: keep imports contiguous, then one blank line. Separate logical groups with one blank line, including inside hooks and callbacks: guards, declarations, helpers, subscriptions, async work, cleanup, and returns. Keep statements for one small task together.

- Conditionals: always use braces for `if`, `else if`, and `else`, including single statements.
