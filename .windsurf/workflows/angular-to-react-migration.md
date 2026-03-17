---
description: Angular to React Migration
---

Playbook: Angular to React Migration

## Overview

Migrate an Angular application to React while achieving full feature parity. The resulting React app must replicate every feature, route, and visual detail of the original Angular app with no missing or new functionality.

## What's Needed From User

- Repository URL or local path to the Angular project
- Target React stack preferences (defaults: React 18 + TypeScript, React Router v6, Vite)
- Any features to exclude or special requirements
- Whether to preserve existing SCSS/CSS or rewrite styles

## Example Prompt

> Migrate the Angular app in [owner/repo] to React, following the attached playbook exactly. The original Angular app is live at [URL] for visual reference.
>
> Repo: [owner/repo]
>
> Follow every step in the playbook in order. Pay special attention to:
> - Taking individual reference screenshots of every page/state in the Angular app (Step 2)
> - CSS scoping (Step 10) — wrap ALL selectors under component wrapper classes, use child combinators to prevent parent styles from leaking into child components, check for cross-component conflicts
> - Screenshot comparison verification (Step 15) — compare each React page against the Angular reference screenshots and fix discrepancies before moving on
>
> Create a PR when done.

## Procedure

1. **Explore the Angular codebase thoroughly.** Read every source file: components, services, modules, routing config, models/interfaces, pipes, guards, stylesheets (shared and component-level), `angular.json`, `package.json`, and `index.html`. Map out the full dependency graph — which components use which services, how data flows, and what the route structure looks like. **For each component, study its template, styles, and behavior as a unit** — understand what it renders, what CSS rules apply to it (including inherited/global styles), what lifecycle hooks it uses, and how it interacts with parent and child components. This per-component understanding is what drives correct conversion.

2. **Build and run the Angular app locally, then capture reference screenshots.** Install dependencies, build, and serve the app on your local machine (do not rely on external hosted URLs — the app must run locally so this playbook works for any Angular project). Navigate to every page and key UI state (modals open, theme switched, dropdowns expanded, error states) and **take a screenshot of each one**, saving them with descriptive filenames (e.g., `angular-news-page.png`, `angular-settings-modal.png`, `angular-night-theme.png`). Also make a screen recording of the full walkthrough. These screenshots become the visual specification for feature parity — each one will be compared against the React version in Step 15.

3. **Share a detailed conversion plan with the user and wait for approval.** The plan should list:
   - Target tech stack (React version, router, bundler, styling approach)
   - Every type/interface to create (show signatures)
   - Every service to convert (Angular DI → React hooks/context)
   - Every component to create (show props signatures)
   - Route mapping (Angular routes → React Router routes)
   - Files to remove and files to add

4. **Set up the React project scaffolding.** Create `package.json`, `tsconfig.json`, Vite config, and `index.html` entry point. Preserve meta tags, manifest links, and analytics scripts from the original `index.html`.

5. **Convert models and types.** Translate Angular classes to TypeScript interfaces. Preserve all fields exactly — watch for Angular-specific class features (decorators, constructor initialization) that need to become plain interface properties.

6. **Convert services to React equivalents.**
   - Replace RxJS `Observable`-based services with `async`/`fetch` functions
   - **Add response status checking to every fetch call.** After `await fetch(...)`, check `if (!res.ok) throw new Error(...)` before calling `res.json()`. Without this, failed HTTP responses (4xx/5xx) silently return garbage data instead of triggering error handling.
   - Replace Angular injectable services that hold state (e.g., settings, auth) with React Context + `useReducer` or `useState`
   - **Critical: When converting stateful services, ensure all persisted state (localStorage, sessionStorage, cookies) is read on initialization.** Do not hardcode defaults for values that are persisted — always read from the storage layer first, then fall back to defaults. This prevents state from resetting on navigation or page reload.

7. **Convert Angular pipes to utility functions.** Create plain TypeScript functions that replicate the pipe's transform logic.

8. **Sanitize all HTML rendered with `dangerouslySetInnerHTML`.** Install `dompurify` (and `@types/dompurify`) and create a `sanitizeHtml` utility. Wrap every `dangerouslySetInnerHTML={{ __html: ... }}` usage through this sanitizer. Angular's template binding sanitizes HTML by default; React's `dangerouslySetInnerHTML` does not.

9. **Implement components bottom-up, studying each Angular component before converting it.** For each component (leaf components first, then composites, then pages): first re-read the Angular component's template, SCSS, and TypeScript together. Understand exactly what it renders, how its styles are scoped by ViewEncapsulation, and how it looks in the Angular recording. Then convert the TSX and its SCSS together:
   - Convert Angular `@Input()` to React props, `@Output()` EventEmitter to callback props
   - Convert `ngOnInit`/`ngOnDestroy` lifecycle hooks to `useEffect`. **Every `useEffect` that fetches data must return a cleanup function that ignores stale responses** — use the `let cancelled = false; ... return () => { cancelled = true; }` pattern, and guard every `setState` call with `if (!cancelled)`. This prevents race conditions when dependencies change before a fetch completes (e.g., navigating between feeds or items quickly).
   - Convert `ngIf`/`ngFor`/`ngSwitch` template directives to JSX conditionals and `.map()`
   - Convert Angular's `routerLink` to React Router's `<Link>` / `<NavLink>`. **Never wrap `<Link>` inside an `<a>` tag** — this produces invalid nested `<a>` elements. If the Angular template has an `<a [routerLink]="...">` with class/style attributes, convert it to `<Link to="..." className="..." style={{...}}>` directly, moving all attributes onto the `<Link>` component.
   - Convert `ActivatedRoute` params to `useParams()` and `useNavigate()`
   - If the Angular app uses forms (template-driven or reactive), convert them to React controlled components with `useState` for form state and `onChange` handlers
   - Convert `@ViewChild`/`@ViewChildren` to `useRef`. If the Angular component accesses a child component's methods or DOM directly, use `useRef<HTMLElement>` for DOM access or lift shared state up / use a callback prop instead of calling child methods imperatively.
   - Convert `<ng-content>` (content projection) to React's `children` prop. If the Angular component uses multiple named slots (`<ng-content select="...">`) convert each slot to a separate named prop (e.g., `header`, `footer`) that accepts `ReactNode`.
   - Convert `@HostListener` to event handlers attached in JSX or via `useEffect` (e.g., `@HostListener('window:resize')` → `useEffect` with `window.addEventListener('resize', ...)` and cleanup). Convert `@HostBinding` to dynamic `className` or `style` on the component's root element.
   - If the Angular app uses **Angular animations** (`@angular/animations`), replace them with CSS transitions/keyframe animations or a React animation library (e.g., `framer-motion`, `react-transition-group`). Map Angular animation triggers to React state booleans that toggle CSS classes.

10. **Scope component styles.** This is the step most likely to cause post-migration bugs — do it carefully for every component.
   - **Wrap every rule in every component SCSS file under a component-specific class** (e.g., `.feed-wrapper { a { font-weight: bold; } }`) and add that `className` to the root `<div>` in TSX. Angular's `ViewEncapsulation` automatically scopes component styles so bare element selectors (e.g., `a {}`, `h1 {}`, `p {}`) only apply within that component. React has no equivalent — importing a plain `.scss` file makes all rules global. Do this for *every* component without exception — do not leave any bare element selectors at the top level of any component SCSS file. Alternatively, use CSS Modules (`.module.scss`) which scope automatically.
   - **Use child combinators (`>`) when a parent component renders child components.** Even with wrapper-class scoping, a parent's element selectors (e.g., `.feed-wrapper a {}`) will match elements inside child components rendered within that wrapper. Use direct child combinators (e.g., `.feed-wrapper > .nav a {}`) to restrict styles to the parent's own DOM and prevent them from leaking into children.
   - **Check for cross-component element selector conflicts when one component is rendered inside another.** If component B is rendered inside component A's DOM tree (e.g., a Settings modal rendered inside a Header), then A's element selectors (e.g., `.header-wrapper h1 {}`) will also match B's elements (e.g., the Settings `<h1>`). Before converting each component, check which parent component renders it and whether that parent has element selectors that could collide. Fix by making the parent's selectors more specific to its own elements (e.g., `.header-wrapper > #header h1 {}`) or by using distinct class selectors instead of bare element selectors.
   - **Replace percentage widths and `display: block` with fixed sizing where needed.** Angular's ViewEncapsulation constrains percentage-based widths (e.g., `width: 80%`) and block-level display to the component's scoped context, so they render correctly against the component's own dimensions. In React, those same rules apply against the full parent container width, causing inputs, panels, and other elements to stretch unexpectedly. Visually compare each component's output against the Angular original and swap percentage/block styles for fixed inline sizing (e.g., `width: 60px`) where the element looks oversized.
   - Remove Angular-specific selectors: `:host`, `:host-context`, `/deep/`, `>>>`
   - Keep shared/global SCSS files (themes, variables, media queries) as-is
   - **Eagerly import SCSS for conditionally-rendered components.** When using Vite, CSS imported by a component is only injected into the DOM when that component first renders. For components behind conditional rendering (modals, popups, drawers), this means their styles may not be present on first display, causing layout breakage. Fix by importing the component's SCSS from a parent that is always mounted (e.g., `import './components/Settings/Settings.scss'` in `App.tsx`).
   - **Audit global/theme SCSS for element selectors that will conflict with components.** Before writing any component styles, grep all global and theme SCSS files for bare element selectors (especially `a {}`, `h1 {}`, `p {}`, `li {}`). These selectors, when nested inside theme classes (e.g., `.default .wrapper a { color: #000 }`), will override component-scoped class selectors because they have higher specificity. For every component that needs different styling for these elements (e.g., white link text on a colored header), pre-emptively add `!important` or use an ID selector to ensure the component styles win (e.g., `#header .header-nav a { color: white !important }`). Also add `:visited` pseudo-class rules where needed — links that have been visited will use the browser default purple unless explicitly styled. Do this audit once at the start of Step 10, not reactively after visual bugs appear.
   - **When fixing a CSS issue in one component, verify that the fix does not regress other components.** CSS changes can cascade — fixing a child component's styles may require overriding a parent's selectors, which can break other children of that same parent. After every CSS fix, reload the app and visually check all components rendered nearby (siblings, parent, children) — not just the component you changed.

11. **Set up routing.** Replicate the Angular route structure exactly using React Router. Preserve redirects, route parameters, and any route guards (convert guards to wrapper components or route-level checks).
   - Convert Angular route guards (`CanActivate`, `CanDeactivate`, `Resolve`) to React equivalents: wrapper components that check conditions and redirect, or `loader`/`action` functions if using React Router v6 data APIs.
   - If the Angular app uses **lazy-loaded modules** (`loadChildren`), convert to `React.lazy()` + `<Suspense>` for code-splitting at the route level.
   - **Analytics/tracking hooks:** If the Angular app tracks page views via `Router.events` (e.g., `NavigationEnd`), convert this to a `useLocation()` + `useEffect` hook. Note that Angular's `NavigationEnd` does not fire for the initial page load before a redirect — if the React app redirects `/` → `/somepage`, use a `useRef` to skip the initial render so the redirect URL is not double-counted.

12. **Convert HTTP interceptors.** If the Angular app uses `HttpInterceptor` (for auth tokens, error handling, logging, caching), create a fetch wrapper function or use a library like `ky` or `axios` with interceptors. Common patterns:
   - Auth interceptor → wrap `fetch` to inject `Authorization` header from context/storage on every request
   - Error interceptor → centralized error handling in the fetch wrapper (complement the per-call `res.ok` checks from Step 6)
   - Loading interceptor → combine with React state to show/hide a global loading indicator

13. **Remove all Angular-specific files.** Delete `angular.json`, `karma.conf.js`, `tsconfig.app.json`, `tsconfig.spec.json`, `tslint.json`, `browserslist`, `polyfills.ts`, `ngsw-config.json`, `e2e/`, and the `src/app/` directory.

14. **Build and type-check.** Run `npx tsc --noEmit` and the Vite build. Fix any TypeScript errors or build failures before proceeding.

15. **Visually verify feature parity using screenshot comparison.** Run the React app and systematically compare it against the Angular reference screenshots from Step 2:
    - For each Angular screenshot, navigate to the same page/state in the React app and take a matching screenshot
    - Open both screenshots (Angular and React) and compare them — check for differences in layout, colors, sizing, spacing, and text styling
    - If any discrepancy is found, fix it immediately before moving to the next page. After fixing, re-take the React screenshot and re-compare to confirm the fix
    - Continue until all pages/states match. Pay special attention to:
      - Text styling (font weight, color, size) — the most common regression area
      - Element sizing — inputs, panels, and containers that use percentage widths or `display: block` may render differently without ViewEncapsulation (see Step 10)
      - Theme switching and persistence across page reloads
      - Modal/popup styling and positioning (verify overlays, fixed positioning, and z-index are intact)
      - Child components rendered inside parent components (e.g., modals inside headers) — verify the child's element selectors are not overridden by the parent's styles
      - Parent components whose styles bleed into child components (check that scoping with child combinators is correct)
      - Navigation link active states, colors, and `:visited` states
      - Responsive behavior if the original supported it
    - After all individual comparisons pass, do a final full walkthrough recording of the React app and compare it against the Angular recording

16. **Create a PR** with the migration. Include before/after recordings or screenshots in the PR description.

## Specifications

- Feature parity: every route, interaction, and visual element from the Angular app must be present in the React version
- No new features or behavior changes beyond what the Angular app provides
- TypeScript strict mode should pass (`tsc --noEmit`)
- Production build should succeed (`vite build` or equivalent)
- All persisted user preferences must survive page reloads and navigation
- Visual diff between Angular and React versions should show no regressions

## Advice and Pointers

- **CSS scoping is the #1 source of post-migration bugs.** Angular's encapsulation hides the problem; React exposes it immediately. Before writing any component TSX, open the corresponding Angular SCSS and wrap all its rules under a scoped wrapper class first. Do not copy bare selectors and plan to scope them later — scope them before they ever run in the browser. After converting each component, visually compare it against the Angular version before moving on — catching scoping issues one component at a time is far easier than debugging them after the full migration.
- **Initialize all state from persistence.** If the Angular service reads from localStorage/sessionStorage anywhere, the React equivalent must read from it at initialization time, not in a useEffect (which runs after first render and causes a flash of default state).
- **Screenshot-driven verification catches more bugs than end-to-end recording alone.** Individual per-page/per-state screenshots are easier to compare than scrubbing through recordings. Take Angular reference screenshots early (Step 2) and compare each one methodically against the React version (Step 15) — this catches subtle styling differences that are easy to miss in a full walkthrough.
- When rewriting API services, keep the same endpoint URLs and response handling. Don't "improve" the API layer during migration.
- Preserve the exact same HTML structure where possible — this keeps CSS behaving identically.

## Forbidden Actions

- Do not add new features, dependencies, or UI elements not present in the Angular version
- Do not "modernize" the CSS architecture (e.g., switch to Tailwind) unless the user explicitly requests it
- Do not skip the visual verification step — styling regressions are the most common migration issue
- Do not use unscoped bare element selectors in component SCSS files — every rule must be nested under a component-specific wrapper class or use CSS Modules
- Do not nest `<Link>` inside `<a>` tags or vice versa — this creates invalid HTML with nested anchors
- Do not use `dangerouslySetInnerHTML` without sanitizing through DOMPurify first
