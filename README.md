<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A Hacker News client, migrated from Angular 9 to React
</p>

---

The app was originally built with Angular. It now runs on **Vite + React 18 + TypeScript (strict) + React Router v6 + Sass**,
with the same pages, look and themes. Data comes from [node-hnapi](https://node-hnapi.herokuapp.com).

Offline support (service worker) was dropped in the migration; the web app manifest and icons are still served as static assets.

## Scripts

Requires Node 22 (`nvm use 22`).

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Vite dev server (http://localhost:5173) |
| `npm run build` | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the unit tests once (Vitest + React Testing Library + jsdom) |
| `npm run lint` | Lint with ESLint (typescript-eslint + react-hooks) |
| `npm run typecheck` | Type-check without emitting |

## Project structure

```
index.html            Vite entry HTML (meta tags, app loader, Google Analytics)
public/               Static assets served as-is (assets/icons, assets/images, favicon.ico, manifest.json)
src/
  main.tsx            Bootstraps React with BrowserRouter + SettingsProvider
  App.tsx             Theme wrapper (default | night | amoledblack), Header, routes, Footer
  AppRoutes.tsx       Routes: / -> /news/1, /:feed/:page, /item/:id, /user/:id (item/user lazy-loaded)
  api/                hackerNewsApi.ts: fetchFeed, fetchItemContent, fetchPollContent, fetchUser
  models/             Story, Comment, User, PollResult, Settings, FeedType, ItemType
  settings/           SettingsProvider + useSettings (persisted to localStorage)
  components/         Shared Loader and ErrorMessage
  features/           feed, item, user pages
  layout/             Header, Footer, Settings panel
  styles/             Global styles and the theme engine (_themes.scss, _theme_variables.scss, _media.scss)
  utils/              commentCount, cx
  test/               Vitest setup and test helpers
```

Component styles are CSS Modules (`*.module.scss`) so they stay scoped like Angular's component styles. Only `src/styles/` is global.

## Themes

Built-in theme engine with Default, Night and Black (AMOLED). Without a saved choice, the theme follows the system
`prefers-color-scheme` setting.

## Deployment

`firebase.json` serves `dist/` (the Vite build output) with an SPA rewrite to `index.html`.

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
