<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="HN PWA" title="HN PWA" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React, TypeScript and Vite.
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

---

:zap: **Fast:** Service Worker (Workbox via [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)) precaches the app shell and uses a `NetworkFirst` strategy for the HN API, so the app loads quickly with or without a network.

:iphone: **Responsive:** Mobile-first UI that can be installed to the home screen for a native-app feel.

:rocket: **Progressive:** Web App Manifest, installable PWA, three built-in themes, and persisted user preferences.

## Tech stack

- [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [Vite 5](https://vitejs.dev/) for dev server and production builds
- [react-router-dom v6](https://reactrouter.com/) for client-side routing (with `React.lazy` + `Suspense` for code-split routes)
- [Sass](https://sass-lang.com/) (per-component `.scss` files, scoped via component-level wrapper classes)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for unit + integration tests
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox under the hood) for service worker + offline caching
- [Firebase Hosting](https://firebase.google.com/docs/hosting) for deployment

## Getting started

This project targets **Node 22**.

```bash
nvm use 22         # or: nvm install 22
npm install
npm run dev        # vite dev server on http://localhost:4200
```

### Other scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check (`tsc -b`) and produce a production build in `dist/`. |
| `npm run preview` | Serve the built `dist/` locally (handy for verifying the production bundle and the registered service worker). |
| `npm test` | Run the Vitest suite once (CI-mode). |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run lint` | Lint `.ts` / `.tsx` sources with ESLint. |
| `npm run format` | Format `src/` with Prettier. |

## Project structure

```
.
├── index.html              # Vite entry HTML (PWA <link rel="manifest"> + GA snippet)
├── vite.config.ts          # Vite + vite-plugin-pwa configuration
├── public/                 # Static assets copied verbatim into dist/
│   ├── manifest.json
│   ├── favicon.ico
│   └── assets/
│       ├── icons/
│       └── images/
└── src/
    ├── main.tsx            # React entrypoint
    ├── App.tsx             # Router + Layout (theme wrapper, GA pageview hook)
    ├── components/
    │   ├── core/           # Header, Footer, Settings popup
    │   ├── feeds/          # Feed (paginated story list) + Item card
    │   ├── item-details/   # ItemDetails + recursive Comment
    │   ├── user/           # User profile
    │   └── shared/         # Loader, ErrorMessage
    ├── context/            # SettingsContext (theme + font + spacing + persistence)
    ├── hooks/              # useHackerNewsApi (fetchFeed / fetchItemContent / fetchUser)
    ├── models/             # Story, User, Comment, FeedType, Settings, PollResult
    ├── utils/              # commentFormatter
    ├── styles/             # Global SCSS theme engine + media mixins
    ├── integration/        # Cross-component navigation tests
    └── test-setup.ts       # Vitest setup (jest-dom matchers)
```

## Themes

Built-in theme engine. Pick one from the cog icon in the header:

- Default
- Night
- Black (AMOLED)

The chosen theme is persisted to `localStorage`. If no theme has been set, the app honours the OS-level `prefers-color-scheme: dark` query.

## Offline support

The PWA service worker (built by `vite-plugin-pwa` with Workbox) precaches the static assets and applies a `NetworkFirst` strategy to the HN API at `https://node-hnapi.herokuapp.com/` so recently-viewed pages stay available offline.

To verify locally:

```bash
npm run build
npm run preview
```

Open the printed URL, then check **DevTools → Application → Service Workers** (a worker should be registered) and **Application → Manifest** (the PWA manifest should be detected).

## Deployment

The production build emits to `dist/`, which Firebase Hosting serves directly:

```bash
npm run build
firebase deploy
```

`firebase.json` already points `hosting.public` at `dist/` and rewrites all routes to `/index.html` for SPA routing.

## Contributors

A million thanks to some awesome people :)

* [Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar)
* [Mateusz](https://github.com/mateuszwitkowski)
* [Jordi Collell](https://github.com/jordic)
* [Ben Brooks](https://github.com/bbrks)
* [Zach Berger](https://github.com/zachberger)
* [blAck PR](https://github.com/blackpr)
* [Bram Borggreve](https://github.com/beeman)
* [Antonio Indrianjafy](https://github.com/Antogin)
* [Addy Osmani](https://github.com/addyosmani)
* [Majid Hajian](https://github.com/mhadaily)
* [Jeff Cross](https://github.com/jeffbcross)
* [Minko Gechev](https://github.com/mgechev)
