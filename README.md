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

This app uses [Workbox](https://workboxjs.org/) — through [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) — to generate a service worker as part of the build step to load quickly and work offline. The app shell (`index.html`, JS/CSS bundles, icons and the manifest) is precached, and navigations fall back to the cached shell when offline.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), this app includes a Web App Manifest (`public/manifest.json`) that allows you to install to your homescreen.

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

## Stack

- [React 18](https://react.dev/) with function components and hooks
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for the dev server and production build
- [React Router v6](https://reactrouter.com/) (the item and user routes are code split with `React.lazy`)
- [Sass](https://sass-lang.com/) for the original theme engine
- [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) (Workbox) for the service worker
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for tests

## Project layout

```
src/
  api/          fetch based Hacker News API client
  components/   header, settings popup, footer, loader, error message
  context/      settings provider (theme, font size, spacing, link behaviour)
  feeds/        feed list and single story row
  item-details/ story page and the recursive comment tree
  models/       shared TypeScript interfaces
  user/         user profile page
  styles/       theme engine partials shared by every component
```

## Build process

 - Clone or download the repo
 - `npm install`
 - `npm start` (or `npm run dev`) to run the app on `localhost:5173`
 - `npm run build` to type check and produce a production build in `dist/`
 - `npm run lint` and `npm test` to run ESLint and the unit tests

Note: the service worker is only generated for production builds. To test service worker changes:
 - `npm run build`
 - `npm run preview` to serve `dist/` with the generated service worker and manifest

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
