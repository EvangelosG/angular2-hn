# Phase 0 Research: Saved Stories

No open `NEEDS CLARIFICATION` items remained after specification. The decisions below
resolve the technical approach against the existing codebase and the constitution.

## Decision: Persist bookmarks in `localStorage` via a dedicated service

- **Decision**: Store saved stories client-side in `localStorage` behind a new
  `SavedStoriesService`, mirroring the existing `SettingsService`.
- **Rationale**: The app is a static, offline-capable PWA with no application backend
  (Principle III). `SettingsService` already reads/writes `localStorage` directly
  (`localStorage.getItem/setItem` with `JSON.parse/stringify`), so following that idiom
  keeps the code consistent and testable.
- **Alternatives considered**:
  - *IndexedDB*: unnecessary complexity for a small, flat list.
  - *Firebase / backend*: violates "no backend" and adds auth/sync scope not requested.
  - *In-memory only*: fails FR-007 (persistence across reloads).

## Decision: Store a full story snapshot, keyed by id

- **Decision**: Persist an array of story snapshots (id, title, url, domain, user, points,
  time_ago, type, comments_count) rather than only ids.
- **Rationale**: Lets the `/saved` page render immediately using the existing `<item>`
  component without re-fetching each story from the HN API (which has no batch endpoint).
- **Alternatives considered**: *Store ids only, refetch on visit* — slower, network-dependent,
  breaks offline; rejected.

## Decision: Reuse `ItemComponent` / `<item>` for the saved list

- **Decision**: `SavedComponent` renders each saved story with the existing `<item>`
  selector, exactly as `FeedComponent` does.
- **Rationale**: Principle II (Existing Structure First) and FR-005 (same presentation).
  `ItemComponent` takes `@Input() item: Story`, so the snapshots map directly.

## Decision: Star toggle lives in `ItemComponent`, bound to the service

- **Decision**: Add a star control to `item.component.html`; `ItemComponent` gets
  `isSaved` / `toggleSaved()` delegating to `SavedStoriesService`.
- **Rationale**: The control must appear on every feed item (FR-001). `ItemComponent` is the
  single presentation used across all feeds, so one edit covers every feed and the saved page.

## Decision: Eager `/saved` route + header nav link

- **Decision**: Add `{ path: 'saved', component: SavedComponent }` to `app.routes.ts` and a
  `saved` link in `core/header`.
- **Rationale**: Feed routes are eager and `SavedComponent` is declared in `AppModule`; an
  eager route matches the existing pattern and avoids introducing a lazy module for one page.

## Decision: Defensive read of stored data

- **Decision**: Wrap `JSON.parse` in try/catch and treat missing/corrupt data as an empty list.
- **Rationale**: Satisfies the "corrupt or missing stored data" edge case without crashing.
