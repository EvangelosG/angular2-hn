<p align="center">
  <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
</p>

<p align="center">
  A progressive Hacker News client built with React, Vite and TypeScript.
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square"></a>
</p>

## Overview

This project was originally written with Angular and has been migrated to a
React + TypeScript codebase scaffolded with [Vite](https://vitejs.dev/). It is
a PWA Hacker News client that uses the
[node-hnapi](https://github.com/cheeaun/node-hnapi) endpoint to render the
news, newest, show, ask and jobs feeds, along with item detail and user
profile pages.

## Stack

- React 18 with hooks and React Router v6
- TypeScript
- Vite for the dev server and build pipeline
- `vite-plugin-pwa` (Workbox) for the service worker / offline support
- SCSS for theming (default, night, AMOLED black)

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The app will be available at <http://localhost:4200>.

Other scripts:

- `npm run build` — Type-check and produce a production build under `dist/`.
- `npm run preview` — Preview the production build locally.
- `npm run lint` — Run a strict TypeScript check (`tsc --noEmit`).

## Project Structure

```
src/
├── App.tsx              # Route definitions + theme wrapper
├── main.tsx             # React entry point
├── index.scss           # Global styles + theme imports
├── components/          # UI components (Header, Footer, Item, Comment, ...)
├── pages/               # Route-level pages (FeedPage, ItemDetailsPage, UserPage)
├── context/             # SettingsProvider (localStorage-backed settings)
├── hooks/               # useSettings, usePageTracking (Google Analytics)
├── services/            # Plain async API client (hackernews-api.ts)
├── models/              # TypeScript interfaces (Story, Comment, User, ...)
├── styles/              # SCSS partials: _media, _theme_variables, _themes
└── utils/               # formatComment and other helpers
```

## PWA

The production build is generated with Workbox via `vite-plugin-pwa`. It
precaches the built assets and uses a `NetworkFirst` strategy for requests to
`node-hnapi.herokuapp.com`.

## License

[MIT](LICENSE.md)
