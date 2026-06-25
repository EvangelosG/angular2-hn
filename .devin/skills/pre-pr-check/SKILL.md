---
name: pre-pr-check
description: Run the full pre-PR quality gate — lint, build, tests, and a
  self-review of the diff. Use before creating or updating any pull request.
model: swe
allowed-tools:
  - read
  - grep
  - glob
  - exec
---

# Pre-PR Quality Gate

This is Angular 9 on modern Node, so every webpack-based command (build/test)
needs the legacy OpenSSL provider. Set it once for this run:

    export NODE_OPTIONS=--openssl-legacy-provider

Follow these steps in order. If a step fails, STOP and report — do not continue.

1. Lint — changed files only. Full-repo `npm run lint` reports a large baseline
   of pre-existing errors (snake_case Hacker News API model fields like
   `time_ago`/`comments_count`, the `_underscore` private-field convention, the
   `<item>` selector), so it is NOT a useful gate — and "fixing" several of
   those would break the app (renaming API fields breaks deserialization;
   renaming the selector breaks templates). Lint only the `.ts` files this
   change touches under `src/`:

       BASE=$(git merge-base HEAD origin/master 2>/dev/null || git merge-base HEAD master 2>/dev/null || echo HEAD)
       FILES=$( { git diff --name-only --diff-filter=ACMR "$BASE"; git ls-files --others --exclude-standard; } | grep -E '^src/.*\.ts$' | grep -v '\.spec\.ts$' | sort -u )
       if [ -n "$FILES" ]; then npx tslint -c tslint.json $FILES; else echo "No changed src .ts files to lint."; fi

   Fix only NEW errors introduced by this change. Do NOT touch pre-existing
   baseline errors in files you didn't modify. Per-file linting (no `-p`) skips
   two type-aware rules — `deprecation` (warn-only here) and the deprecated
   `no-use-before-declare`; run full `npm run lint` if you need those. (tslint
   doesn't use webpack, so the OpenSSL flag isn't needed for this step.)

2. Build: `npm run build`. Highest-value gate — runs AOT (catches Angular
   template errors), TypeScript type checks, and enforces bundle budgets.
   Without NODE_OPTIONS set this crashes with ERR_OSSL_EVP_UNSUPPORTED.

3. Tests: `npm test -- --watch=false --browsers=ChromeHeadless`.
   - Plain `npm test` runs Karma in WATCH mode and never exits — always pass
     --watch=false. Requires Chrome/Chromium for ChromeHeadless.
   - Note: there are currently no *.spec.ts files in src/, so this reports zero
     tests. When tests are added, ensure they all pass.

4. Self-review: inspect `git diff` (unstaged) and `git diff --staged` (staged):
   - No leftover debug statements — `console.log` slips past this repo's tslint
     config, so check manually.
   - No commented-out code.
   - New application code under `src/` is TypeScript (.ts), not plain JS.
     (Config files like karma.conf.js / e2e/protractor.conf.js are legitimately
     JS — don't flag those.)
   - Variables, methods, and properties use camelCase.
   - No unintended edits to brand assets in `src/assets/`.

5. Summarize what was checked and each step's result before proceeding.
