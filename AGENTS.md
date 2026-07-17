# AGENTS.md

Guidance for coding agents working in this repository.

## Project overview

`angular-hnpwa` (aka "Angular 2 HN") is a Progressive Web App Hacker News client.

- **Framework:** Angular 9 (`@angular/*` ~9.0.1, Angular CLI ~9.0.2)
- **Language:** TypeScript ~3.7.5 (target `es2015`, module `esnext`)
- **Reactivity:** RxJS ~6.5.4 (plus `rxjs-compat`)
- **Styling:** SCSS (component-scoped + shared partials under `src/app/shared/scss/`)
- **PWA:** `@angular/service-worker` with `ngsw-config.json` (service worker is enabled in production builds only)
- **HTTP:** `unfetch` (fetch polyfill), wrapped in Observables — the app does **not** use `HttpClient`
- **Backend/API:** public HN API at `https://node-hnapi.herokuapp.com` (no auth, no server in this repo)
- **Deploy:** Firebase Hosting via Travis CI

## Commands

| Task | Command |
| --- | --- |
| Dev server (http://localhost:4200) | `npm start` (`ng serve`) — needs the OpenSSL flag, see [Running the app locally](#running-the-app-locally) |
| Production build → `dist/angular-hnpwa` | `npm run build` (`ng build`) |
| Unit tests (Karma + Jasmine) | `npm test` (`ng test`) |
| Lint (TSLint + codelyzer) | `npm run lint` (`ng lint`) |
| E2E tests (Protractor) | `npm run e2e` |

### Running the app locally

The canonical way to start the dev server (verified on Node v25):

```
NODE_OPTIONS=--openssl-legacy-provider npm start
```

Then open http://localhost:4200/. Startup takes a few seconds; you know it worked when you see the
chunk list followed by:

```
** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **
: Compiled successfully.
```

Snags you will hit, in order:

1. **`ERR_OSSL_EVP_UNSUPPORTED` (crashes immediately).** A plain `npm start` dies before serving
   with `Error: error:0308010C:digital envelope routines::unsupported` from `webpack .../createHash.js`.
   This is Angular 9 / webpack 4 on modern Node's OpenSSL 3. Fix: prefix the command with
   `NODE_OPTIONS=--openssl-legacy-provider` (or `export` it once for the shell). This is the same flag
   the build/test commands need — see below.

2. **`DEP0060 DeprecationWarning: The util._extend API is deprecated`.** Printed on startup and is
   **harmless** — the server still compiles and serves. Do not try to "fix" it.

3. **Port 4200 already in use.** If a previous `ng serve` is still running, free the port before
   restarting:

   ```
   lsof -i :4200 -sTCP:LISTEN -n -P      # find the PID(s)
   kill <PID>                            # stop npm start / ng serve
   ```

### Critical environment gotchas

- **OpenSSL / Node:** This is Angular 9 (webpack 4). On modern Node it crashes with
  `ERR_OSSL_EVP_UNSUPPORTED` unless you set the legacy provider first. Export it once per shell
  before any webpack-based command (**serve/start**, **build**, and **test**):

  ```
  export NODE_OPTIONS=--openssl-legacy-provider
  ```

  (TSLint does not use webpack, so linting does not need this flag.)

- **Tests hang by default:** plain `npm test` runs Karma in **watch mode** and never exits, and it
  needs Chrome/Chromium. For a one-shot run use:

  ```
  npm test -- --watch=false --browsers=ChromeHeadless
  ```

  There are currently **no `*.spec.ts` files** under `src/`, so this reports zero tests. Ensure any
  tests you add pass.

- **Lint has a large pre-existing baseline:** full-repo `npm run lint` reports many pre-existing
  errors (intentional snake_case API model fields, the `_underscore` private-field convention, the
  `<item>` component selector). It is **not** a useful gate, and "fixing" several of those would
  break the app. Lint only the files your change touches, and fix only errors your change
  introduces — do not touch baseline errors in files you didn't modify.

### Before opening a PR

Run the **`pre-pr-check`** skill (`.devin/skills/pre-pr-check/SKILL.md`) — it is the authoritative
quality gate (changed-file lint, build, tests, self-review) and encodes the caveats above. Prefer it
over ad-hoc commands so guidance doesn't drift.

## Architecture

Entry point `src/main.ts` bootstraps `AppModule` (`src/app/app.module.ts`). Routing is defined in
`src/app/app.routes.ts` (`RouterModule.forRoot`).

```
src/app/
  app.component.*          Root shell
  app.module.ts           Root module
  app.routes.ts           Routes (see below)
  core/                   CoreModule: header, footer, settings (chrome shown on every page)
  feeds/                  feed, item (list row) components
  item-details/           Lazy-loaded module: item-details + comment (story + comment thread)
  user/                   Lazy-loaded module: user profile
  shared/
    components/           error-message, loader (+ SharedComponentsModule)
    models/               story, user, comment, poll-result, settings, feed-type.type
    pipes/                comment.pipe (+ PipesModule)
    services/             hackernews-api, settings
    scss/                 _media, _theme_variables, _themes (theme engine)
```

### Routing model

- `''` → redirects to `news/1`
- `news` | `newest` | `show` | `ask` | `jobs` → `FeedComponent`, each with a `:page` child route and
  a `data.feedType` discriminator
- `item` → lazy-loaded `ItemDetailsModule`
- `user` → lazy-loaded `UserModule`

### Services

- **`HackerNewsAPIService`** (`shared/services/hackernews-api.service.ts`) — wraps `unfetch` in a
  cancelable `Observable` (`lazyFetch`); provides `fetchFeed`, `fetchItemContent` (expands polls),
  `fetchPollContent`, `fetchUser`. Provided in `AppModule`.
- **`SettingsService`** — user/theme settings. Provided in `AppModule`.

### Theming

Built-in theme engine (Default, Night, Black/AMOLED) implemented in `shared/scss/`.

## Conventions

- **Components:** element selectors, `app` prefix, kebab-case (e.g. `app-feed`). Styles are SCSS and
  the CLI schematic default is `scss`.
- **Directives:** attribute selectors, `app` prefix, camelCase.
- **Quotes / casing:** single quotes; camelCase for variables, methods, and properties.
- **snake_case model fields are intentional:** `Story`/etc. expose fields like `time_ago`,
  `comments_count`, `poll_votes_count` to match the HN API JSON shape. **Do not rename them** —
  deserialization relies on the exact names.
- **`console.log` is not caught by TSLint** here (only `debug`/`info`/`time`/`timeEnd`/`trace` are).
  Remove stray logging manually before committing.
- **Formatting is inconsistent between tools** — be careful and match the surrounding file:
  - `.editorconfig`: 2-space indentation.
  - Prettier config in `package.json`: `tabWidth: 4`, `singleQuote: true`, `trailingComma: es5`,
    `printWidth: 120`.
  - TSLint: `max-line-length: 140`, `member-ordering` (static-field → instance-field →
    static-method → instance-method), `rxjs/Rx` import is blacklisted.
- New application code under `src/` must be TypeScript (`.ts`). Config files such as `karma.conf.js`
  and `e2e/protractor.conf.js` are legitimately JS.

## Known stale docs / gotchas

- `README.md` and `CONTRIBUTING.md` reference scripts that **no longer exist** in `package.json`
  (`npm run precache`, `npm run static-serve`) and a deprecated `ng init` step. The project migrated
  from an ejected-webpack setup to Angular CLI 9; ignore those instructions and trust `package.json`
  / `angular.json`.
- `.travis.yml` pins a very old Node (`6.9`) and deploys to Firebase — it does not reflect the Node
  version needed to build locally today (see the OpenSSL note above).
