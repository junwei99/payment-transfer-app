# Technology choices

- Expo Router handles navigation. File-based routes keep screen structure easy to follow.
- Uniwind with Tailwind CSS 4 styles React Native components. Shared utility classes and theme values keep the UI consistent across iOS and Android.
- Zod validates API responses and form input. Inferring TypeScript types from schemas keeps runtime validation and static types in sync.
- React Hook Form manages form values and validation state. Its Zod integration keeps validation rules in the schemas, and a shared provider preserves values across screens.
- TanStack Query manages server data. Caching and query invalidation keep the UI up to date after API writes.
- Zustand manages shared client state outside forms. It gives that state one owner without duplicating form values or cached API data.
- Axios handles HTTP requests through a shared requestor. Centralized configuration keeps timeouts, cancellation, and response handling consistent.
- Expo's ESLint preset checks code quality using rules suited to React Native.
