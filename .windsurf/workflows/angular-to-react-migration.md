---
description: Migrate an Angular application to React (Vite + TypeScript + SCSS)
---

# Angular to React Migration Workflow

A step-by-step workflow for converting an Angular application to React with Vite, TypeScript, and SCSS. Apply this to any Angular app regardless of size or complexity.

---

## Phase 1: Audit the Angular App

1. **Inventory all routes** — List every route in the Angular `app-routing.module.ts` (or lazy-loaded routing modules). Note which modules are lazy-loaded.

2. **Inventory all components** — List every component, its inputs/outputs, and what template features it uses (pipes, directives, structural directives).

3. **Inventory all services** — List every injectable service and what state/logic it manages. Note which use localStorage, HTTP, or observables.

4. **Inventory models** — List all TypeScript interfaces/classes used for data.

5. **Inventory assets and styles** — Note global stylesheets, SCSS variables/mixins, theme systems, media breakpoints, and static assets (images, icons, manifest, favicon).

6. **Document the API layer** — Base URLs, endpoints, auth patterns, interceptors.

7. **Write this audit into a plan file** (e.g. `.windsurf/plans/migration-plan.md`) before writing any code.

---

## Phase 2: Scaffold the React Project

1. **Create a `react-app/` subdirectory** inside the existing repo to avoid conflicts during development:
   ```
   npm create vite@latest react-app -- --template react-ts
   cd react-app && npm install
   ```

2. **Install dependencies**:
   - `react-router-dom` (routing)
   - `sass` (SCSS support)
   - Any other libraries needed (state management, UI libraries, etc.)

3. **Copy static assets** from Angular's `src/assets/` into `react-app/public/assets/`.

4. **Copy favicon, manifest.json, icons** into `react-app/public/`.

5. **Recreate `index.html`** — Port meta tags, analytics scripts, noscript blocks, skip-to-content links, and any inline loading screens.

---

## Phase 3: Port Styles

1. **Copy SCSS variables, mixins, and theme files** into `react-app/src/styles/`.

2. **Copy global stylesheet** (`styles.scss`) and import it in `main.tsx`.

3. **Copy component SCSS files** into their respective component directories.

4. **⚠️ CRITICAL — Scope component styles**: Angular's `ViewEncapsulation` automatically scopes bare element selectors (`a {}`, `h1 {}`, `p {}`) to the component. React does NOT. You must:
   - Wrap each component's SCSS rules under a unique class (e.g. `.feed-wrapper { a { ... } }`)
   - Add the corresponding `className` to the root element in the TSX
   - For elements that need to override theme/global styles, use `!important` or increase specificity
   - Watch for `&.class` (same element) vs `.class` (child element) in SCSS nesting

5. **Do NOT use CSS Modules** if the app relies on global class names for theming, NavLink active states, or cross-component selectors. CSS Modules hash all class names, breaking these patterns. Use the wrapper-class pattern instead.

6. **Replace Angular-specific selectors**: Remove `:host`, `::ng-deep`, `>>>` and replace with standard CSS selectors.

---

## Phase 4: Port TypeScript Models

1. Create `react-app/src/models/` with all interfaces/types.
2. Convert Angular classes to TypeScript interfaces where they're data-only.
3. Keep enums and union types as-is.

---

## Phase 5: Port Services → Context + Hooks + Functions

Use this mapping:

| Angular Pattern | React Pattern |
|---|---|
| Injectable service with state | React Context + `useContext` hook |
| Injectable service (stateless logic) | Plain utility functions |
| HTTP service | Async functions using `fetch` |
| Observables / RxJS | `useState` + `useEffect`, or React Query |
| localStorage persistence | Read synchronously in initial state, write in callbacks |

**⚠️ CRITICAL — localStorage in initial state**: Always read persisted values (theme, settings, tokens) synchronously in the `useState` initializer function, NOT in `useEffect`. Otherwise the state resets on every navigation before the effect fires.

```tsx
// ✅ Correct
const [settings] = useState(() => ({
  theme: localStorage.getItem('theme') || 'default',
}));

// ❌ Wrong — causes flash/reset on navigation
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
| `*ngIf` | `{condition && <Component />}` or ternary |
| `*ngFor` | `.map()` |
| `[innerHTML]` | `dangerouslySetInnerHTML={{ __html: value }}` |
| `(click)` | `onClick` |
| `[(ngModel)]` | `value` + `onChange` |
| `[class.active]` | Conditional className string |
| `routerLink` | `<Link>` or `<NavLink>` |
| `routerLinkActive` | NavLink `className` callback: `({ isActive }) => isActive ? 'active' : ''` |
| `ActivatedRoute.params` | `useParams()` |
| `Location.back()` | `useNavigate()` then `navigate(-1)` |
| Pipes | Helper functions called inline |
| Lazy-loaded modules | `React.lazy(() => import(...))` + `<Suspense>` |

**⚠️ JSX whitespace**: JSX strips whitespace between elements more aggressively than Angular templates. Add explicit spaces where needed: `{' '}` or include a space in the text content.

---

## Phase 7: Port Routing

1. Map Angular routes to React Router v6 `<Routes>` and `<Route>` elements.
2. Use `<Navigate to="..." replace />` for redirects.
3. Use `<Outlet />` for nested layouts.
4. Wrap lazy-loaded components in `<Suspense fallback={<Loader />}>`.

---

## Phase 8: Verify Feature Parity

Run through this checklist against the original Angular app:

- [ ] All routes render correctly
- [ ] Data fetching works (loading, success, error states)
- [ ] Pagination / navigation works
- [ ] Settings/preferences persist across navigation and page reload
- [ ] Theme switching works without flash on navigation
- [ ] External links respect settings (e.g. open in new tab)
- [ ] Dynamic styling works (font sizes, spacing, etc.)
- [ ] Responsive layouts match at all breakpoints
- [ ] Interactive features work (collapse/expand, modals, toggles)
- [ ] No cross-component style leaking
- [ ] Accessibility features preserved (skip links, ARIA, focus management)
- [ ] Analytics/tracking still fires on route changes

---

## Phase 9: Promote React App to Root

Once the React app is stable and verified:

1. Create an `angular-legacy/` directory
2. Move all Angular-specific files into it:
   - `angular.json`, `karma.conf.js`, `tslint.json`, `tsconfig.app.json`, `tsconfig.spec.json`
   - `e2e/`, Angular `src/`
   - Angular `package.json`, `yarn.lock` / `package-lock.json`
   - `.editorconfig`, CI configs, Firebase configs, etc.
3. Move `react-app/` contents to the project root
4. Remove the empty `react-app/` directory
5. Verify `npm run dev` and `npm run build` work from the new root
6. Update `.gitignore` if needed

---

## Common Pitfalls

| Pitfall | Solution |
|---|---|
| Bare element selectors leak globally | Wrap under component-specific wrapper class |
| CSS Modules break theme/global classes | Use plain SCSS with wrapper-class scoping |
| Theme resets on navigation | Read localStorage synchronously in useState initializer |
| `.wrapper .overlay` doesn't match same element | Use `&.overlay` for same-element compound selectors |
| Missing spaces between inline elements | Add explicit spaces in JSX |
| Angular animations | Replace with CSS transitions or framer-motion |
| RxJS complex streams | Simplify with useEffect + useState, or use React Query / SWR |
| Angular interceptors | Use a fetch wrapper function or Axios interceptors |
