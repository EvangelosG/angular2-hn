# Quickstart: Validate Saved Stories

Prerequisites: Node 12 (via nvm), repo dependencies installed (`npm install`).

## Run the unit tests (service contract)

```bash
source ~/.nvm/nvm.sh && nvm use 12
npx ng test --watch=false --browsers=ChromeHeadless
```

Expected: `SavedStoriesService` specs pass — add/remove/toggle/isSaved, no-duplicate,
persistence across a new instance, and corrupt-data returns `[]`
(see [contracts/saved-stories-service.md](./contracts/saved-stories-service.md)).

## Build

```bash
source ~/.nvm/nvm.sh && nvm use 12 && npx ng build
```

Expected: build succeeds (exit 0).

## Manual validation (rendered app)

Serve the production build statically, then:

1. Open any feed (e.g. `/news/1`). **Expect** a star control on every story.
2. Click a story's star. **Expect** it switches to the saved (filled) state immediately (SC-001).
3. Open the **saved** link in the header → `/saved`. **Expect** the saved story listed with
   the standard presentation (User Story 2, FR-005).
4. Reload the app, return to `/saved`. **Expect** the story still there (User Story 3, FR-007).
5. Unsave the story from `/saved`. **Expect** it disappears without reload (FR-006).
6. With nothing saved, view `/saved`. **Expect** the empty state (FR-008).
