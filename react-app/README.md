# React HN

A React port of the Angular Hacker News PWA that lives at the root of this repository. Built with Vite, TypeScript,
React Router and `vite-plugin-pwa`.

## Scripts

```bash
npm install
npm run dev        # dev server on http://localhost:5173
npm run build      # type-check + production build (service worker + manifest included)
npm run preview    # serve the production build
npm run test       # vitest
npm run lint       # oxlint
```

Node 22 is required (the Angular app at the repo root still uses Node 12).

## Where the Angular code went

| Angular                                          | React                                                  |
| ------------------------------------------------ | ------------------------------------------------------ |
| `shared/services/hackernews-api.service.ts`       | `src/api/hackernews.ts` + `src/hooks/useHackerNews.ts`  |
| `shared/services/settings.service.ts`             | `src/context/SettingsContext.tsx` + `src/hooks/useSettings.ts` |
| `shared/models/*`                                 | `src/models/*`                                          |
| `shared/pipes/comment.pipe.ts`                    | `src/utils/formatComments.ts`                           |
| `app.routes.ts`                                   | `src/routes.tsx`                                        |
| `app.component`                                   | `src/App.tsx`                                           |
| `core/{header,footer,settings}`                   | `src/components/{Header,Footer,Settings}`               |
| `feeds/{feed,item}`                               | `src/components/{Feed,Item}`                            |
| `item-details/*`                                  | `src/components/ItemDetails/*` (lazy loaded)            |
| `user/*`                                          | `src/components/User/*` (lazy loaded)                   |
| `shared/components/{loader,error-message}`        | `src/components/shared/{Loader,ErrorMessage}`           |
| `shared/scss/*`, `styles.scss`                    | `src/styles/*`                                          |
| `@angular/service-worker` (`ngsw-worker.js`)      | `vite-plugin-pwa` (Workbox `sw.js`)                     |

RxJS observables were replaced with `async`/`await` plus `AbortController` for cancellation; `unfetch` was dropped in
favour of native `fetch`.
