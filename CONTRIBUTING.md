# Contributing

Thanks for your interest in contributing! Issues and PRs are very welcome.

## Setup

1. Fork the repo and clone your fork.
2. Use Node 22 (`nvm use 22`).
3. Install dependencies: `npm install`.
4. Make a topic branch: `git checkout -b my-feature`.

## Dev workflow

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server on `http://localhost:4200`. |
| `npm test` | Run the Vitest suite once. Add unit/integration tests alongside any new code. |
| `npm run test:watch` | Vitest in watch mode while you iterate. |
| `npm run lint` | ESLint. Must be clean before opening a PR. |
| `npm run format` | Prettier — formatting must match `.prettierrc` before submitting. |
| `npm run build` | Type-checks + production build. Must succeed before opening a PR. |
| `npm run preview` | Serves the production build locally so you can verify the service worker registration and PWA manifest in DevTools. |

## Code style

- TypeScript strict mode is on; no `any` escape hatches and no `// @ts-ignore` without a comment explaining why.
- Component SCSS lives next to its `.tsx` and is wrapped under a component-specific class. Bare element selectors (e.g. `a { ... }`) MUST be nested inside that wrapper to avoid leaking globally — React has no `ViewEncapsulation`.
- Keep components small and presentation-focused; talk to the API through `src/hooks/useHackerNewsApi.ts` so it can be mocked in tests.
- Follow the existing Prettier config (4-space tabs, single quotes, trailing commas: `es5`, 120-column print width).

## Tests

- Unit tests live next to the component (`Foo.tsx` ↔ `Foo.test.tsx`).
- Cross-component tests live in `src/integration/`.
- Aim to add at least one test for any new component, hook, or utility — please don't let coverage shrink.

## Pull requests

1. Make sure `npm run lint`, `npm test`, and `npm run build` all pass.
2. Push your branch to your fork.
3. Open a PR against `master`. Reference any related issue in the description (e.g. `Closes #5`).
4. CI/review will follow up — happy to iterate together.
