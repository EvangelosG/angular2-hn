---
description: Migrate an Angular application to React (Vite + TypeScript + SCSS) — Improved Plan v2
---

# Angular to React Migration Workflow (v2)

A step-by-step workflow for converting an Angular application to React with Vite, TypeScript, and SCSS. This is a revised version of the original plan with additional phases for testing, PWA support, deployment, CI/CD, error handling, and API resilience.

---

## Phase 1: Audit the Angular App

1. **Inventory all routes** — List every route in `app-routing.module.ts` (or lazy-loaded routing modules). Note which modules are lazy-loaded and any route guards.

2. **Inventory all components** — List every component, its inputs/outputs, and template features used (pipes, directives, structural directives, animations).

3. **Inventory all services** — List every injectable service and what state/logic it manages. Note which use localStorage, HTTP, observables, or interceptors.

4. **Inventory models** — List all TypeScript interfaces/classes used for data.

5. **Inventory assets and styles** — Note global stylesheets, SCSS variables/mixins, theme systems, media breakpoints, and static assets (images, icons, manifest, favicon).

6. **Document the API layer** — Base URLs, endpoints, auth patterns, interceptors. **Verify that all external API endpoints are still live.** If any are deprecated (e.g. Heroku free-tier URLs), identify replacements before starting work.

7. **Inventory PWA features** — Document service worker config (`ngsw-config.json`), cached assets, offline behavior, and install prompts. Decide whether to carry these forward.

8. **Inventory CI/CD and deployment** — Document existing pipelines (e.g. `.travis.yml`), deployment targets (e.g. Firebase Hosting), and environment configs (`.firebaserc`, `firebase.json`).

9. **Inventory tests** — List existing unit tests (Karma/Jasmine) and e2e tests (Protractor). Note coverage and which tests are critical.

10. **Write this audit into a plan file** (e.g. `.windsurf/plans/migration-plan.md`) before writing any code.

---

## Phase 2: Scaffold the React Project

1. **Create a `react-app/` subdirectory** inside the existing repo to avoid conflicts during development:
   ```
   npm create vite@latest react-app -- --template react-ts
   cd react-app && npm install
   ```

2. **Install core dependencies**:
   ```
   npm install react-router-dom sass
   ```

3. **Install dev/test dependencies** (see Phase 10 for details):
   ```
   npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
   ```

4. **Copy static assets** from Angular's `src/assets/` into `react-app/public/assets/`.

5. **Copy favicon, manifest.json, icons** into `react-app/public/`.

6. **Recreate `index.html`** — Port meta tags, analytics scripts, noscript blocks, skip-to-content links, and any inline loading screens.

---

## Phase 3: Port Styles

1. **Copy SCSS variables, mixins, and theme files** into `react-app/src/styles/`.

2. **Copy global stylesheet** (`styles.scss`) and import it in `main.tsx`.

3. **Copy component SCSS files** into their respective component directories.

4. **CRITICAL — Scope component styles**: Angular's `ViewEncapsulation` automatically scopes bare element selectors (`a {}`, `h1 {}`, `p {}`) to the component. React does NOT. You must:
   - Wrap each component's SCSS rules under a unique class (e.g. `.feed-wrapper { a { ... } }`)
   - Add the corresponding `className` to the root element in the TSX
   - For elements that need to override theme/global styles, use increased specificity (prefer this over `!important`)
   - Watch for `&.class` (same element) vs `.class` (child element) in SCSS nesting

5. **Do NOT use CSS Modules** if the app relies on global class names for theming, NavLink active states, or cross-component selectors. CSS Modules hash all class names, breaking these patterns. Use the wrapper-class pattern instead.

6. **Replace Angular-specific selectors**: Remove `:host`, `::ng-deep`, `>>>` and replace with standard CSS selectors.

   | Angular Selector | Replacement |
   |---|---|
   | `:host` | `.component-wrapper` (the root class on your component) |
   | `:host(.active)` | `.component-wrapper.active` |
   | `::ng-deep .child` | `.component-wrapper .child` (but watch for global leaking) |
   | `>>>` | Remove entirely; use plain descendant selectors |

---

## Phase 4: Port TypeScript Models

1. Create `react-app/src/models/` with all interfaces/types.
2. Convert Angular classes to TypeScript interfaces where they're data-only.
3. Keep enums and union types as-is.
4. Fix any typos inherited from the Angular codebase (e.g. `crated_time` -> `created_time`) and update all references.

---

## Phase 5: Port Services -> Hooks + Context + Functions

Use this mapping:

| Angular Pattern | React Pattern |
|---|---|
| Injectable service with state | React Context + `useContext` hook |
| Injectable service (stateless logic) | Plain utility functions or custom hooks |
| HTTP service | Async functions using `fetch` (or a thin wrapper) |
| Observables / RxJS | `useState` + `useEffect` for simple cases |
| HTTP interceptors | A shared `fetchWithDefaults()` wrapper (see below) |
| localStorage persistence | Read synchronously in initial state, write in callbacks |
| Pipes | Plain functions (e.g. `formatCommentCount()`) |

### API Wrapper

Create a shared fetch wrapper instead of calling `fetch()` directly in every service function. This is the React equivalent of Angular's HTTP interceptors:

```tsx
const API_BASE = import.meta.env.VITE_API_BASE || 'https://node-hnapi.herokuapp.com';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

Benefits:
- Centralized base URL (configurable via env var — critical if the API host changes)
- Consistent error handling
- Single place to add auth headers, retries, or logging later

### CRITICAL — localStorage in initial state

Always read persisted values (theme, settings, tokens) synchronously in the `useState` initializer function, NOT in `useEffect`. Otherwise the state resets on every navigation before the effect fires.

```tsx
// Correct
const [settings] = useState(() => ({
  theme: localStorage.getItem('theme') || 'default',
}));

// Wrong — causes flash/reset on navigation
const [settings, setSettings] = useState({ theme: 'default' });
useEffect(() => {
  const saved = localStorage.getItem('theme');
  if (saved) setSettings(prev => ({ ...prev, theme: saved }));
}, []);
```

---

## Phase 6: Port Components

Use this mapping for each component:

| Angular Concept | React Equivalent |
|---|---|
| `@Input()` | Props |
| `@Output()` / `EventEmitter` | Callback props |
| `ngOnInit` / `ngOnChanges` | `useEffect` |
| `ngOnDestroy` | `useEffect` cleanup function |
| `*ngIf` | `{condition && <Component />}` or ternary |
| `*ngFor` / `trackBy` | `.map()` with `key` prop |
| `[innerHTML]` | `dangerouslySetInnerHTML={{ __html: value }}` |
| `(click)` | `onClick` |
| `[(ngModel)]` | `value` + `onChange` |
| `[class.active]` | Conditional className string |
| `routerLink` | `<Link>` or `<NavLink>` |
| `routerLinkActive` | NavLink `className` callback: `({ isActive }) => isActive ? 'active' : ''` |
| `ActivatedRoute.params` | `useParams()` |
| `ActivatedRoute.queryParams` | `useSearchParams()` |
| `Location.back()` | `useNavigate()` then `navigate(-1)` |
| Pipes | Helper functions called inline |
| Lazy-loaded modules | `React.lazy(() => import(...))` + `<Suspense>` |
| `@angular/animations` | CSS transitions, or `framer-motion` if complex |

### JSX whitespace

JSX strips whitespace between elements more aggressively than Angular templates. Add explicit spaces where needed: `{' '}` or include a space in the text content.

### Component port order

Port components bottom-up (leaf components first, containers last) so you can test each one as you go:

1. **Shared/leaf**: Loader, ErrorMessage
2. **Data display**: Item, Comment
3. **Data fetching**: Feed, ItemDetails, UserProfile
4. **Layout**: Header, Footer, Settings
5. **Root**: App (with routing)

---

## Phase 7: Port Routing

1. Map Angular routes to React Router v6 `<Routes>` and `<Route>` elements.
2. Use `<Navigate to="..." replace />` for redirects.
3. Use `<Outlet />` for nested layouts.
4. Wrap lazy-loaded components in `<Suspense fallback={<Loader />}>`.
5. **Preserve scroll position** — React Router v6 doesn't scroll to top on navigation by default. Add a `<ScrollToTop />` component using `useLocation()` + `useEffect` if the Angular app scrolled to top on route change.
6. **Port analytics route tracking** — If the Angular app fires analytics on route change (e.g. Google Analytics `page_view`), add an equivalent `useEffect` in `App.tsx` that watches `location.pathname`.

---

## Phase 8: Add Error Boundaries

Angular has a global `ErrorHandler` class. React uses Error Boundaries.

1. Create a top-level `<ErrorBoundary>` component (class component — hooks can't catch render errors):

   ```tsx
   class ErrorBoundary extends Component<Props, State> {
     state = { hasError: false };
     static getDerivedStateFromError() { return { hasError: true }; }
     componentDidCatch(error: Error, info: ErrorInfo) {
       console.error('Uncaught error:', error, info);
     }
     render() {
       if (this.state.hasError) return <ErrorMessage />;
       return this.props.children;
     }
   }
   ```

2. Wrap `<App />` (or individual route-level components) with `<ErrorBoundary>`.
3. Optionally add route-level error boundaries so a crash in one page doesn't take down the whole app.

---

## Phase 9: Port PWA Features (if applicable)

The Angular app may use `@angular/service-worker` with `ngsw-config.json` for offline caching and install prompts. Vite does not include this by default.

**If you need PWA support:**

1. Install `vite-plugin-pwa`:
   ```
   npm install -D vite-plugin-pwa
   ```

2. Configure in `vite.config.ts`:
   ```ts
   import { VitePWA } from 'vite-plugin-pwa';

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         manifest: {
           name: 'Hacker News',
           short_name: 'HN',
           theme_color: '#b92b27',
           icons: [/* port from manifest.json */],
         },
         workbox: {
           runtimeCaching: [
             {
               urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*/i,
               handler: 'NetworkFirst',
               options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 } },
             },
           ],
         },
       }),
     ],
   });
   ```

3. Port the Angular `ngsw-config.json` caching strategy into Workbox config.
4. Test offline behavior and install prompt.

**If you don't need PWA support**, skip this phase and remove `manifest.json` references from `index.html` to avoid console warnings.

---

## Phase 10: Add Testing

The Angular app had Karma unit tests and Protractor e2e tests. Replace these with modern React equivalents.

### Unit / Component Tests (Vitest + Testing Library)

1. Configure Vitest in `vite.config.ts`:
   ```ts
   export default defineConfig({
     test: {
       environment: 'jsdom',
       globals: true,
       setupFiles: './src/test/setup.ts',
     },
   });
   ```

2. Create `src/test/setup.ts`:
   ```ts
   import '@testing-library/jest-dom';
   ```

3. Add a `test` script to `package.json`:
   ```json
   "test": "vitest",
   "test:ci": "vitest run --coverage"
   ```

4. Write tests for critical paths, prioritized:
   - API service functions (mock fetch, verify URL construction and error handling)
   - Settings context (verify localStorage read/write, theme switching)
   - Feed component (verify loading/error/data states render correctly)
   - Comment component (verify recursive rendering, collapse/expand)
   - Routing (verify redirects, lazy loading, 404 handling)

### E2E Tests (Playwright — optional)

If the Angular app had Protractor e2e tests:

1. Install Playwright:
   ```
   npm init playwright@latest
   ```

2. Write smoke tests covering:
   - Homepage loads and displays stories
   - Navigation between feed types
   - Story detail page with comments
   - Settings persistence across navigation
   - Theme switching

---

## Phase 11: Verify Feature Parity

Run through this checklist against the original Angular app:

- [ ] All routes render correctly
- [ ] Data fetching works (loading, success, error states)
- [ ] API errors are handled gracefully (not white screen)
- [ ] Pagination / navigation works
- [ ] Settings/preferences persist across navigation and page reload
- [ ] Theme switching works without flash on navigation
- [ ] System dark mode preference is detected on first visit
- [ ] External links respect settings (e.g. open in new tab)
- [ ] Dynamic styling works (font sizes, spacing, etc.)
- [ ] Responsive layouts match at all breakpoints
- [ ] Interactive features work (collapse/expand, modals, toggles)
- [ ] No cross-component style leaking
- [ ] Accessibility features preserved (skip links, ARIA, focus management)
- [ ] Analytics/tracking still fires on route changes
- [ ] Lazy-loaded routes show loading fallback
- [ ] Back button behavior works correctly
- [ ] `dangerouslySetInnerHTML` content renders safely (links, formatting)
- [ ] Build completes with zero TypeScript errors
- [ ] All tests pass

---

## Phase 12: Update Deployment & CI/CD

### Firebase Hosting (if using Firebase)

1. Update `firebase.json` to point to the Vite build output:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [{ "source": "**", "destination": "/index.html" }]
     }
   }
   ```

2. Copy `.firebaserc` to the project root if not already present.

3. Test locally:
   ```
   npm run build && npx firebase serve
   ```

### CI Pipeline

Replace the Angular-era CI config (e.g. `.travis.yml`) with a modern equivalent. Example GitHub Actions workflow (`.github/workflows/ci.yml`):

```yaml
name: CI
on: [push, pull_request]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm test -- --run
```

---

## Phase 13: Promote React App to Root

Once the React app is stable and verified:

1. Create an `angular-legacy/` directory.
2. Move all Angular-specific files into it:
   - `angular.json`, `karma.conf.js`, `tslint.json`, `tsconfig.app.json`, `tsconfig.spec.json`
   - `e2e/`, Angular `src/`
   - Angular `package.json`, `package-lock.json` / `yarn.lock`
   - `.editorconfig`, `.travis.yml`
   - `ngsw-config.json`
3. Move `react-app/` contents to the project root.
4. Remove the empty `react-app/` directory.
5. Verify `npm run dev`, `npm run build`, and `npm test` all work from the new root.
6. Update `.gitignore` (add `dist/`, remove Angular-specific entries).
7. Update `README.md` with new dev/build/test/deploy commands.

---

## Phase 14: Cleanup

1. **Delete `angular-legacy/`** once the React app has been deployed and verified in production. Keep it on a branch or tag if you want a reference.
2. **Remove unused dependencies** — run `npx depcheck` to find packages that are installed but not imported.
3. **Audit bundle size** — run `npx vite-bundle-visualizer` to check for unexpectedly large chunks.
4. **Update `README.md`** with final tech stack, scripts, and architecture overview.

---

## Appendix A: Angular -> React Concept Mapping (Quick Reference)

| Angular | React |
|---|---|
| Modules (`NgModule`) | No equivalent (just imports) |
| Components (class + template + style) | Function components (TSX + SCSS import) |
| `@Input()` / `@Output()` | Props / callback props |
| Services (`@Injectable`) | Context, hooks, or plain functions |
| Pipes | Plain functions |
| Directives | Props or wrapper components |
| Guards | Wrapper components or `loader` functions |
| Interceptors | Fetch wrapper function |
| RxJS Observables | `useState` + `useEffect`, or data-fetching libraries |
| `ViewEncapsulation` | Wrapper-class scoping in SCSS |
| `ErrorHandler` | Error Boundaries |
| Angular CLI | Vite |
| Karma + Jasmine | Vitest + Testing Library |
| Protractor | Playwright |
| `@angular/service-worker` | `vite-plugin-pwa` (Workbox) |

---

## Appendix B: Common Pitfalls

| Pitfall | Solution |
|---|---|
| Bare element selectors leak globally | Wrap under component-specific wrapper class |
| CSS Modules break theme/global classes | Use plain SCSS with wrapper-class scoping |
| Theme resets on navigation | Read localStorage synchronously in `useState` initializer |
| `.wrapper .overlay` doesn't match same element | Use `&.overlay` for same-element compound selectors |
| Missing spaces between inline elements | Add `{' '}` in JSX |
| Angular animations | Replace with CSS transitions or `framer-motion` |
| RxJS complex streams | Simplify with `useEffect` + `useState` |
| Angular interceptors | Use a shared fetch wrapper function |
| API host is dead/deprecated | Use env var for base URL; verify endpoints during audit |
| No error boundary -> white screen on crash | Add `<ErrorBoundary>` at app and/or route level |
| No tests -> silent regressions | Add Vitest + Testing Library during migration, not after |
| `*ngFor` without `trackBy` -> missing `key` | Always add a unique `key` prop to `.map()` elements |
| `ngOnDestroy` cleanup lost | Return cleanup function from `useEffect` |
| Route change doesn't scroll to top | Add `<ScrollToTop />` using `useLocation` |
