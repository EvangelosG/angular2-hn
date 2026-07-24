# Contract: SavedStoriesService

UI contract for the client-side persistence service that backs the Saved Stories feature.
Location: `src/app/shared/services/saved-stories.service.ts` (provided in root).

## Public interface

```ts
class SavedStoriesService {
  /** All saved stories, most-recently-saved first. */
  getAll(): Story[];

  /** True if a story with this id is currently saved. */
  isSaved(id: number): boolean;

  /** Save a story. No-op if already saved. Persists to localStorage. */
  add(story: Story): void;

  /** Remove a story by id. No-op if not saved. Persists to localStorage. */
  remove(id: number): void;

  /** Save if unsaved, remove if saved. Returns the new saved state. */
  toggle(story: Story): boolean;
}
```

## Behavioral contract

| # | Given | When | Then |
|---|-------|------|------|
| 1 | no saved stories | `add(storyA)` | `isSaved(A.id)` is `true`; `getAll()` contains A |
| 2 | A saved | `add(storyA)` again | still exactly one A (no duplicate) |
| 3 | A saved | `remove(A.id)` | `isSaved(A.id)` is `false`; `getAll()` excludes A |
| 4 | A not saved | `toggle(storyA)` | returns `true`; A is saved |
| 5 | A saved | `toggle(storyA)` | returns `false`; A is removed |
| 6 | A saved, page reloaded (new instance) | `getAll()` | still contains A (localStorage persistence) |
| 7 | localStorage value corrupt/missing | `getAll()` | returns `[]` (no throw) |

## Persistence

- Reads/writes the `savedStories` key in `localStorage` as JSON, mirroring the
  `SettingsService` `getItem`/`setItem` + `JSON.parse`/`stringify` idiom.
