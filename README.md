<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React 18, TypeScript and Vite
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

## Stack

* [React 18](https://react.dev/) with function components and hooks
* [TypeScript](https://www.typescriptlang.org/)
* [Vite](https://vitejs.dev/) for the dev server and production build
* [React Router](https://reactrouter.com/) (lazy loaded item and user routes)
* [Sass](https://sass-lang.com/) for the theme engine and component styles
* [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) for the service worker
* [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/) for unit tests

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

This app uses [Workbox](https://workboxjs.org/), via `vite-plugin-pwa`, to generate a service worker as part of the build step to load quickly and work offline.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), React HN includes a Web App Manifest that allows you to install to your homescreen.

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

 - Clone or download the repo
 - `npm install`
 - `npm run dev` to start the Vite dev server on `localhost:5173`
 - `npm run build` to type check and kick off a production build into `dist/`
 - `npm run preview` to serve the production build (including the service worker) locally
 - `npm test` to run the unit tests, `npm run lint` to lint the project

Note: the service worker is only generated for production builds, so use `npm run build && npm run preview` to test offline behaviour.

## Project structure

```
src/
  api/          Hacker News REST client (promise based)
  components/   core (header, footer, settings), feeds, item-details, user, shared
  context/      SettingsContext: theme, font size, list spacing, link behaviour
  scss/         theme engine (default, night, amoledblack) and media queries
  types/        Story, Comment, PollResult, Settings, User models
  utils/        comment count formatting
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
