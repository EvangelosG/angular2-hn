<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React, TypeScript and Vite
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

This app uses [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox `generateSW`) to generate a service worker at build time. It precaches the app shell and static assets and falls back to `index.html` for client-side routes, so the app loads quickly and works offline.

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

## Build process

The app is built with Vite, React 18, TypeScript (strict), React Router v6, Sass CSS Modules and vite-plugin-pwa. Tests use Vitest and React Testing Library; linting uses ESLint (flat config). Use Node 22.

 - Clone or download the repo
 - `npm ci` to install dependencies from the lockfile
 - `npm run dev` to start the dev server at http://localhost:5173
 - `npm run build` to type-check and build into `dist/` (served by Firebase hosting)
 - `npm run preview` to serve the production build, including the service worker
 - `npm test` to run the unit tests once (Vitest)
 - `npm run lint` to lint with ESLint
 - `npm run typecheck` to type-check with `tsc -b`

Note: The service worker only runs in production builds, so use `npm run build && npm run preview` to test offline support.

### Project layout

 - `src/main.tsx`, `src/App.tsx`, `src/routes.tsx`: entry point, theme wrapper and route table
 - `src/layout/`: header, settings popup and footer
 - `src/features/feed`, `src/features/item`, `src/features/user`: route pages (item and user are lazy-loaded)
 - `src/api/`, `src/models/`, `src/settings/`: Hacker News API client, types and persisted user settings
 - `src/components/`, `src/utils/`, `src/styles/`, `src/analytics/`: shared UI, helpers, global themes and Google Analytics page views
 - `public/`: manifest, favicon and static assets

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
