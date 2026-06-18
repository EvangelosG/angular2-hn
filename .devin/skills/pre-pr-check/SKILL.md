---
name: pre-pr-check
description: Run the full pre-PR quality gate — lint, build, tests, and a
  self-review of the diff. Use before creating or updating any pull request.
---

# Pre-PR Quality Gate

Follow these steps in order. Do not skip steps.

1. Run `npm run lint`. Fix any errors **introduced by your change**. The repo has some pre-existing lint errors on `master` — compare against the baseline and do not try to fix unrelated ones here.
2. Run `npm run build` to catch Angular template and TypeScript type errors.
3. Run `npm test` and ensure all tests pass.
4. Review your own diff with `git diff` and check:
   - No debug statements (console.log, debugger) left behind
   - No commented-out code
   - All new files are TypeScript (.ts) — never plain JS
   - Variables, methods, and properties use camelCase; strings use single quotes
   - New colors reuse the shared SCSS theme variables (`src/app/shared/scss/`) — no hardcoded hex values in component styles
   - No edits to `src/assets/` brand assets
5. Summarize what was checked and the results before proceeding.
