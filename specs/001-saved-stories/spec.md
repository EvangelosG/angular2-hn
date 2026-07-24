# Feature Specification: Saved Stories

**Feature Branch**: `001-saved-stories`

**Created**: 2026-07-20

**Status**: Draft

**Input**: User description: "Add a 'Saved Stories' feature. Users can bookmark any story from the feed with a star toggle on each item, and view all saved stories on a new 'saved' page reachable from the header nav. Bookmarks persist across reloads. The saved page reuses the existing story item presentation and shows an empty state when nothing is saved. Toggling a bookmark off removes it from the list."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bookmark a story from the feed (Priority: P1)

A reader browsing any feed (news, newest, ask, show, jobs) wants to keep a story to
read later. They tap a star control on the story and it is marked as saved, without
leaving the feed or reloading the page.

**Why this priority**: This is the core of the feature — without the ability to save a
story, nothing else has value. It is a complete, demonstrable slice on its own.

**Independent Test**: Open any feed, toggle the star on a story, and confirm the control
switches to its "saved" state immediately.

**Acceptance Scenarios**:

1. **Given** a story in the feed that is not saved, **When** the reader activates its star control, **Then** the story is marked as saved and the control shows a filled/active state.
2. **Given** a story that is already saved, **When** the reader activates its star control again, **Then** the story is unmarked and the control returns to its inactive state.

---

### User Story 2 - View all saved stories on a dedicated page (Priority: P1)

A reader wants to see everything they have saved in one place. They open a "saved" link
in the header navigation and land on a page listing all their saved stories using the
same presentation as the feed.

**Why this priority**: Saving is only useful if the reader can revisit their saved items.
Together with Story 1 this forms the minimum viable feature.

**Independent Test**: With at least one saved story, open the "saved" page from the header
and confirm every saved story appears using the standard story presentation.

**Acceptance Scenarios**:

1. **Given** one or more saved stories, **When** the reader opens the "saved" page, **Then** all saved stories are listed using the existing story item presentation.
2. **Given** the reader is on the "saved" page, **When** they unsave a story from that page, **Then** the story is removed from the list without a page reload.

---

### User Story 3 - Bookmarks persist across reloads (Priority: P2)

A reader who saved stories earlier expects them to still be there after closing and
reopening the app, or after a reload.

**Why this priority**: Persistence turns the feature from a session gimmick into something
genuinely useful, but the save/view flows must exist first.

**Independent Test**: Save a story, reload the app, open the "saved" page, and confirm the
story is still listed.

**Acceptance Scenarios**:

1. **Given** a reader has saved stories, **When** they reload or reopen the app, **Then** the previously saved stories are still marked as saved and appear on the "saved" page.

---

### Edge Cases

- **No saved stories**: the "saved" page shows a clear, friendly empty state instead of a blank list.
- **Unsaving the last story**: removing the only saved story returns the "saved" page to its empty state without a reload.
- **A story appears in multiple feeds**: its saved state is consistent everywhere it is shown.
- **Corrupt or missing stored data**: the app treats it as "no saved stories" rather than crashing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present a save/unsave (star) control on every story item in every feed.
- **FR-002**: Users MUST be able to save a story and unsave a previously saved story via that control.
- **FR-003**: The save control MUST visually distinguish saved from unsaved stories.
- **FR-004**: The system MUST provide a "saved" entry in the header navigation that opens a dedicated saved-stories page.
- **FR-005**: The saved-stories page MUST list all saved stories using the same story presentation used in the feeds.
- **FR-006**: Users MUST be able to unsave a story directly from the saved-stories page, and the story MUST disappear from the list immediately.
- **FR-007**: Saved stories MUST persist across reloads and app restarts on the same device/browser.
- **FR-008**: When no stories are saved, the saved-stories page MUST display an empty state.
- **FR-009**: A story's saved state MUST be consistent across all views in which it appears.

### Key Entities *(include if feature involves data)*

- **Saved Story**: a reference to a Hacker News story the reader has bookmarked. Minimally identified by the story's unique id, with enough detail to render it in a list (e.g. title, url, author, score, time, comment count) without re-fetching.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reader can save a story from the feed in a single interaction, with the control reflecting the new state instantly.
- **SC-002**: 100% of a reader's saved stories appear on the saved-stories page.
- **SC-003**: Saved stories remain available after a reload or app restart (0% loss under normal use).
- **SC-004**: When nothing is saved, the reader sees a clear empty state rather than a blank page.

## Assumptions

- Saved stories are personal to the device/browser; no cross-device sync or account is required.
- No backend or server-side storage is introduced; persistence is local to the client.
- The existing story presentation component is suitable for reuse on the saved-stories page.
- Readers do not need folders, tags, or ordering controls in this version (out of scope for v1).
