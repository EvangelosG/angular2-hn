# Phase 1 Data Model: Saved Stories

## Entity: Saved Story

A reference to a Hacker News story the reader has bookmarked, stored with enough detail to
render it in a list without re-fetching. It reuses the existing `Story` model
(`src/app/shared/models/story.ts`); no new model class is required.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Unique story id — the identity used for save/unsave/isSaved |
| `title` | `string` | Rendered as the list item title |
| `url` | `string` | Story link (drives internal vs external link behavior) |
| `domain` | `string` | Optional host label shown next to the title |
| `user` | `string` | Author, shown in the subtext |
| `points` | `number` | Score, shown in the subtext |
| `time_ago` | `number` | Human-friendly relative time already computed by the API service |
| `type` | `FeedType` | Story type (job/story/etc.); controls subtext rendering |
| `comments_count` | `number` | Comment count shown in the subtext |

### Storage shape

- **Key**: `savedStories` (in `localStorage`)
- **Value**: JSON-serialized `Story[]` (array of the snapshots above)

### Validation & rules

- `id` MUST be unique within the stored array (no duplicate saves of the same story).
- Saving an already-saved story is a no-op; unsaving a non-saved story is a no-op.
- Reading a missing or unparseable value yields an empty list (no throw).

### State transitions

```text
unsaved --toggleSaved()/add()--> saved      (append snapshot, persist)
saved   --toggleSaved()/remove()--> unsaved (drop by id, persist)
```

`isSaved(id)` reflects current membership and drives the star control's visual state
consistently across every view (FR-009).
