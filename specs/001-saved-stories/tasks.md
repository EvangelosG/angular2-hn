# Tasks: Saved Stories

**Input**: Design documents from `/specs/001-saved-stories/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — the constitution (Principle V) makes unit tests mandatory for new features.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (bookmark), US2 (saved page), US3 (persistence)

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: The persistence service every story depends on.

- [ ] T001 Create `SavedStoriesService` in `src/app/shared/services/saved-stories.service.ts`
  with `getAll()`, `isSaved(id)`, `add(story)`, `remove(id)`, `toggle(story)`, backed by the
  `savedStories` `localStorage` key (mirroring `SettingsService`), with defensive JSON parsing.
- [ ] T002 [P] Unit spec `src/app/shared/services/saved-stories.service.spec.ts` covering the
  behavioral contract in `contracts/saved-stories-service.md` (add/remove/toggle/isSaved,
  no-duplicate, persistence across a new instance, corrupt-data → `[]`).

**Checkpoint**: Service exists and is tested — user stories can proceed.

---

## Phase 2: User Story 1 — Bookmark a story from the feed (P1) 🎯 MVP

**Goal**: A star toggle on every feed item that saves/unsaves via the service.

**Independent Test**: Toggle the star on a feed story; it flips to the saved state instantly.

- [ ] T003 [US1] Edit `src/app/feeds/item/item.component.ts` to inject `SavedStoriesService`
  and expose `isSaved` + `toggleSaved()`.
- [ ] T004 [US1] Edit `src/app/feeds/item/item.component.html` to add a star control bound to
  `toggleSaved()` with an `aria-label`, reflecting saved/unsaved state.
- [ ] T005 [P] [US1] Edit `src/app/feeds/item/item.component.scss` to style the star in its
  saved and unsaved states.

**Checkpoint**: Bookmarking works from every feed.

---

## Phase 3: User Story 2 — View all saved stories on a dedicated page (P1)

**Goal**: A `/saved` page listing saved stories with `<item>` and an empty state, reachable
from the header.

**Independent Test**: With a saved story, open `saved` in the header and see it listed; unsave
from the page and it disappears.

- [ ] T006 [US2] Create `SavedComponent` (`src/app/feeds/saved/saved.component.ts`) that reads
  `SavedStoriesService.getAll()`.
- [ ] T007 [US2] Create `src/app/feeds/saved/saved.component.html` rendering each story with
  `<item>` and an empty state when the list is empty.
- [ ] T008 [P] [US2] Create `src/app/feeds/saved/saved.component.scss` for page/empty-state styling.
- [ ] T009 [US2] Declare `SavedComponent` in `src/app/app.module.ts`.
- [ ] T010 [US2] Add `{ path: 'saved', component: SavedComponent }` to `src/app/app.routes.ts`.
- [ ] T011 [US2] Add a `saved` nav link to `src/app/core/header/header.component.html`.

**Checkpoint**: Saved page renders and is reachable; unsave from it updates the list.

---

## Phase 4: User Story 3 — Bookmarks persist across reloads (P2)

**Goal**: Saved stories survive reloads/restarts.

**Independent Test**: Save a story, reload, open `/saved` — it is still there.

- [ ] T012 [US3] Confirm `SavedStoriesService` reads existing `localStorage` on construction so
  saved state and the `/saved` list survive reload (covered by the persistence case in T002).

---

## Phase 5: Polish & Validation

- [ ] T013 Run `ng test` (ChromeHeadless) and ensure the service spec passes; coverage does not regress.
- [ ] T014 Run `ng build` and ensure it succeeds.
- [ ] T015 Walk through `quickstart.md` manual validation (star, `/saved`, persistence, empty state).

---

## Dependencies & Execution Order

- **T001** blocks everything; **T002** can run alongside once T001's interface exists.
- **US1 (T003–T005)** and **US2 (T006–T011)** depend only on T001.
- Within US1: T003 before T004; T005 [P]. Within US2: T006 before T007; T009→T010→T011 wire-up.
- **T013–T015** run after implementation.

## Parallel Opportunities

- T002 [P] (spec) alongside US1/US2 implementation.
- T005 [P] (item scss) and T008 [P] (saved scss) are independent files.
