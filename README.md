<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React + TypeScript (migrated from Angular)
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
  <a href="https://travis-ci.org/housseindjirdeh/angular2-hn"><img alt="Build Status" src="https://travis-ci.org/housseindjirdeh/angular2-hn.svg?branch=master"></a>
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** [Lighthouse](https://github.com/GoogleChrome/lighthouse) score of 87/100.

<p align="center">
  <img src = "http://i.imgur.com/fzJzLFO.png" width=500>
</p>

## Mobile Preview

<p align="center">
  <img src = "http://i.imgur.com/ZloA1hn.gif">
</p>

## Laptop Preview

<p align="center">
  <img src = "http://i.imgur.com/MrKHaln.gif">
</p>

## Offline Support

This app uses [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox `generateSW`) to generate a service worker as part of the build step to load quickly and work offline. The app shell (HTML, JS, CSS, icons, manifest) is precached and Hacker News API responses are served network-first with a one hour cache fallback.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), Angular 2 HN includes a Web App Manifest that allows you to install to your homescreen.

<p align="center">
  <img src = "http://i.imgur.com/1RaaNkr.png">
</p>

## Themes

Built in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

More to come!

## Areas of improvement

 - Realtime updating using the Firebase SDK (may need to add option to settings so service worker can still rely on REST endpoints)
 - Server side rendering

Feel free to send me feedback on [twitter](https://twitter.com/hdjirdeh) or [file an issue](https://github.com/hdjirdeh/angular2-hn/issues/new)! Feature requests are always welcome.

## Tech stack

- [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- [React Router 6](https://reactrouter.com/) (lazy-loaded item and user routes)
- [Vite 5](https://vitejs.dev/) with [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the service worker and web app manifest
- [Sass](https://sass-lang.com/) for the theme engine
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for unit tests
- Data comes from the [node-hnapi](https://github.com/cheeaun/node-hnapi) REST API (user profiles fall back to [api.hnpwa.com](https://api.hnpwa.com/))

## Project structure

```
index.html            Vite entry (mounts #root, loads src/main.tsx)
vite.config.ts        Vite, Vitest and PWA (manifest + Workbox) configuration
tsconfig.json         TypeScript config for the app (npm run typecheck)
tsconfig.node.json    TypeScript config for vite.config.ts
public/               Static assets served at the web root (icons, images, favicon)
src/
  main.tsx            ReactDOM bootstrap, router, settings provider, service worker registration
  App.tsx             Route table
  api/                Hacker News API client
  models/             TypeScript models for stories, comments, polls, users, settings
  context/            SettingsContext (theme, font size, list spacing, link target; persisted to localStorage)
  components/         Layout (header, footer, settings panel), feed items, comments, shared loader/error
  pages/              FeedPage, ItemDetailsPage, UserPage
  hooks/              usePageTracking (Google Analytics page views)
  pwa/                Service worker registration
  styles/             Global styles and the Default / Night / Black (AMOLED) themes
  test/               Vitest setup and render helpers
```

## Setup

Requires Node.js 22 (or any current LTS) and npm.

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the Vite dev server at http://localhost:5173 with hot module replacement. The service worker is **not** registered in development; use the production preview below to test PWA behaviour.

Other useful scripts:

| Script | Description |
| --- | --- |
| `npm run typecheck` | Type-check the app with `tsc --noEmit` |
| `npm test` | Run the Vitest unit tests once |
| `npm run test:watch` | Run Vitest in watch mode |

## Build

```bash
npm run build
```

Produces an optimised production bundle in `dist/react-hnpwa/`, including `sw.js`, the Workbox runtime and `manifest.webmanifest`.

To test the production build (and the service worker) locally:

```bash
npm run preview
```

then open http://localhost:4173. On the first load the service worker installs and precaches the app shell; from the second load onwards the app works offline.

## Deploy

The app is hosted on Firebase Hosting. `firebase.json` points hosting at `dist/react-hnpwa`, rewrites every route to `index.html` and sets cache headers for the service worker, manifest and hashed assets.

```bash
npm install -g firebase-tools
npm run build
firebase login
firebase use default      # or `firebase use experiment`
firebase deploy --only hosting
```

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
