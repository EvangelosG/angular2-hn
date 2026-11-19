---
name: angular-to-react-migration-workflow
description: Dynamic workflow that migrates this Angular 9 HN PWA to React 18 + Vite + TypeScript with parallel child sessions. Use when asked to migrate/port angular2-hn from Angular to React, especially with a dynamic workflow.
---

# Angular → React migration workflow

`workflow.py` is a `run_workflow` script (invoke the `dynamic-workflows` skill first). It runs 7–8 separate-VM child sessions:

| Stage | Agents | Output |
|---|---|---|
| foundation | 1 | Branch `BASE` from `master`: Vite/React/TS/Router v6/Vitest/ESLint/vite-plugin-pwa scaffold, shared layer (`src/api`, `src/models`, `src/settings`, `src/components`, `src/styles`, `App.tsx`, routes) and one stub folder per feature, plus a per-feature contract |
| features | 4 in parallel | `BASE-layout`, `BASE-feed`, `BASE-item`, `BASE-user`; each agent edits only its own folder (`src/layout`, `src/features/<name>`) so merges don't conflict. Cross-folder needs come back as `shared_change_requests` |
| integrate | 1 | Merges the feature branches, applies shared change requests, updates `.travis.yml`/README, runs all checks, opens one PR into `master` |
| review | 1–2 rounds | Runs Angular (`master` worktree, Node 12, :4200) and React (Node 22, :5173) side by side, fixes gaps on `BASE`, posts one PR comment with screenshots |

A failed feature agent doesn't abort the run: integrate implements that feature itself from its contract. Review stops after 2 rounds or when a round makes no progress.

## How to run

1. Get the user's approval of the plan first.
2. Copy `workflow.py` somewhere outside the repo, and set `BASE` to a fresh `<UTC datetime>-react-migration` (e.g. `date -u +%Y%m%d%H%M%S`). The script refuses to start while `BASE` is the placeholder.
3. `run_workflow(workflow_name="angular2-hn-react-migration", script_path=<copy>)`.
4. To resume a paused run, pass its `run_id` with the same copy: an unchanged `BASE` keeps recorded results replayable.
5. When it finishes, check out `BASE` yourself and run `npm ci && npm run lint && npm run typecheck && npm test && npm run build` on Node 22 before you report.

A reference run took about 20 minutes and 32 ACUs, with zero merge conflicts.

## Before changing the prompts

`ENV_NOTES` in `workflow.py` holds the verified repo gotchas: Node 22, the leftover Angular lockfile, the user API on `api.hnpwa.com`, CSS Modules plus global theme classes, the `matchMedia` stub, and global-styles import order. Keep it up to date: every agent's prompt includes it.
