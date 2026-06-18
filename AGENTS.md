# AGENTS.md

## Project overview
A Hacker News PWA client built with Angular 9, TypeScript, RxJS, and Sass, served as an offline-capable App Shell via the Angular service worker.

## Commands
- Dev server: `npm start` (runs `ng serve`)
- Build: `npm run build` — also performs Angular's template/type checking
- Lint: `npm run lint` (runs `ng lint` / TSLint) — run before committing and fix any errors your change introduces
- Tests: `npm test` (Karma + Jasmine)
- E2E: `npm run e2e` (Protractor)

> Note: `npm run lint` currently reports some pre-existing errors on `master`. Focus on not introducing new ones; don't try to fix the whole backlog in an unrelated change.

## Code conventions
- Use Angular components (`*.component.ts` + `*.component.html` + `*.component.scss`); follow the existing module structure under `src/app/`
- All code is TypeScript (`.ts`) — never add plain JS
- Use camelCase for variables, methods, and properties
- Use single quotes for strings (TSLint enforces this)
- Component styles live next to each component as `.scss`; shared theme variables and mixins live in `src/app/shared/scss/` — reuse them instead of hardcoding colors
- Use the existing `HackerNewsAPIService` (`src/app/shared/services/`) for HN data access; it already wraps `unfetch`/`node-fetch` — don't add axios
- Follow `tslint.json` and `.editorconfig` for formatting

## Theme engine
- Themes are defined declaratively. To add a theme:
  1. Add its color variables to `src/app/shared/scss/_theme_variables.scss`
  2. Register it with the `@include theme(...)` mixin in `src/app/shared/scss/_themes.scss`
  3. Add a radio option in `src/app/core/settings/settings.component.html`
- Existing themes: `default` (day), `night`, `amoledblack`. Reuse the existing variable naming pattern (`$theme-<name>-...`).

## Boundaries
- Never modify files in `src/assets/` — they are brand assets
- Don't change `angular.json` or the service worker config (`ngsw-config.json`) without asking
