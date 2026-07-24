# Implementation Plan: Saved Stories

**Branch**: `001-saved-stories` | **Date**: 2026-07-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-saved-stories/spec.md`

## Summary

Add the ability to bookmark Hacker News stories and revisit them on a dedicated `/saved`
page. A new `SavedStoriesService` persists saved stories in `localStorage` (mirroring the
existing `SettingsService`). `ItemComponent` gains a star toggle bound to that service, a
new `SavedComponent` renders saved stories by reusing the existing `<item>` component with
an empty state, and a `saved` link + `/saved` route wire it into the app.

## Technical Context

**Language/Version**: TypeScript ~3.7 (Angular 9.0.1)

**Primary Dependencies**: Angular 9, RxJS 6.5, Angular Router; no new dependencies

**Storage**: Browser `localStorage` (client-side only, no backend)

**Testing**: Karma + Jasmine (`ng test`)

**Target Platform**: Evergreen browsers (Angular 9 PWA)

**Project Type**: Single web application (Angular SPA / PWA)

**Performance Goals**: No regression to existing Time-to-Interactive; star toggle and
saved-page render are instant (local, no network)

**Constraints**: Offline-capable PWA; no backend; reuse existing module/component structure;
en-US only; ships with unit tests

**Scale/Scope**: One new service, one new component (+route +nav link), a small edit to
`ItemComponent`. Saved-list size is bounded by user behavior (tens–hundreds of items).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance |
|-----------|------------|
| I. Mandatory Stack | ✅ Angular 9 + TypeScript + SCSS + RxJS only; no new deps |
| II. Existing Structure First | ✅ New code lives under `feeds`/`shared`; reuses `ItemComponent` + `<item>`; route added in `app.routes.ts`; nav link in `core/header` |
| III. Client-Side Persistence via Services | ✅ `SavedStoriesService` wraps `localStorage`, mirroring `SettingsService`; no backend |
| IV. English-Only (en-US) | ✅ All identifiers, comments, and UI text in en-US |
| V. Tests Ship With Every Feature | ✅ `saved-stories.service.spec.ts` covers add/remove/toggle/isSaved + persistence |

**Result**: PASS — no violations, Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-saved-stories/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── saved-stories-service.md   # Service interface contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── spec.md
```

### Source Code (repository root)

```text
src/app/
├── shared/
│   ├── services/
│   │   ├── settings.service.ts          # existing pattern to mirror
│   │   ├── saved-stories.service.ts     # NEW — localStorage-backed bookmarks
│   │   └── saved-stories.service.spec.ts# NEW — unit tests
│   └── models/
│       └── story.ts                     # existing (reused; no change required)
├── feeds/
│   ├── item/
│   │   ├── item.component.ts            # EDIT — inject service, toggle/isSaved
│   │   ├── item.component.html          # EDIT — add star control
│   │   └── item.component.scss          # EDIT — star styling (saved/unsaved)
│   └── saved/
│       ├── saved.component.ts           # NEW — lists saved stories
│       ├── saved.component.html         # NEW — <item> list + empty state
│       └── saved.component.scss         # NEW — page styling
├── core/
│   └── header/
│       └── header.component.html        # EDIT — add "saved" nav link
├── app.routes.ts                        # EDIT — add { path: 'saved', component: SavedComponent }
└── app.module.ts                        # EDIT — declare SavedComponent
```

**Structure Decision**: `ItemComponent` and `FeedComponent` are declared in the root
`AppModule` (not a separate lazy module), so `SavedComponent` is declared there too, which
lets it use the existing `<item>` selector directly. Routing stays eager for `/saved`, matching
the eager feed routes in `app.routes.ts`. The persistence service goes in `shared/services`
alongside `SettingsService`, whose `localStorage` read/write idiom it mirrors.

## Complexity Tracking

> No constitution violations — section intentionally empty.
