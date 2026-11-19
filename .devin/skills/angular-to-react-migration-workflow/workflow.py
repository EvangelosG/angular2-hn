import asyncio
import json

REPO = "EvangelosG/angular2-hn"
REPOS = [REPO]
# Set to a fresh "<UTC datetime>-react-migration" before each new run; keep it unchanged when resuming.
BASE = "CHANGE_ME-react-migration"
FEATURES = ["layout", "feed", "item", "user"]

ENV_NOTES = """Environment notes (verified on this repo's VMs):
- Use Node 22: `source ~/.nvm/nvm.sh && nvm use 22`. The VM default Node is v12, which is too old.
- The VM snapshot leaves the Angular `package-lock.json` (untracked) and `node_modules` in the checkout. Before checking out a React branch, move that lockfile aside, then `rm -rf node_modules && npm install --legacy-peer-deps` on Node 22.
- Use `npm install --legacy-peer-deps` (otherwise the old TypeScript 3.7.5 stays installed).
- Type-check with the `npm run typecheck` script, not `npx tsc --noEmit`.
- In Vitest `src/setupTests.ts`, stub `window.matchMedia` as a plain function, NOT `vi.fn()` (`vi.restoreAllMocks()` wipes a vi.fn stub and SettingsProvider crashes).
- Angular ViewEncapsulation scoped component styles; React does not. Port every component stylesheet to a CSS Module (`*.module.scss`) so bare element selectors do not leak.
- In `src/main.tsx` import the global `styles.scss` BEFORE `App`, otherwise CSS Module rules lose specificity ties to the theme rules like `.{theme} .wrapper a`. Where Angular's scoped style won, raise specificity (e.g. `:global(#header) .header-nav a`).
- API: feeds and items come from `https://node-hnapi.herokuapp.com` (`/{feedType}?page=N`, `/item/{id}`). Its `/user/:id` endpoint is DOWN (404); fetch users from `https://api.hnpwa.com/v0/user/{id}.json`.
- Branch naming convention: `<datetime>-<feature>`; use exactly the branch names given in this prompt. Never push to master. Never force-push.
"""

STACK = (
    "Target stack: Vite + React 18 + TypeScript (strict) + React Router v6 + Vitest + React Testing Library + "
    "ESLint (flat config) + Sass with CSS Modules + vite-plugin-pwa (replaces Angular's service worker / ngsw-config.json, "
    "precaching the app shell and assets so the app works offline). npm scripts must be exactly: "
    "`dev`, `build`, `preview`, `test` (vitest run), `lint`, `typecheck`."
)

TIMELIMITS = {"foundation": 60, "features": 45, "integrate": 45, "review": 60}

FOUNDATION_SCHEMA = {
    "type": "object",
    "properties": {
        "branch": {"type": "string"},
        "commit_sha": {"type": "string"},
        "checks_passed": {"type": "boolean"},
        "summary": {"type": "string"},
        "contract_layout": {"type": "string"},
        "contract_feed": {"type": "string"},
        "contract_item": {"type": "string"},
        "contract_user": {"type": "string"},
    },
    "required": ["branch", "commit_sha", "checks_passed", "summary",
                 "contract_layout", "contract_feed", "contract_item", "contract_user"],
}

FEATURE_SCHEMA = {
    "type": "object",
    "properties": {
        "feature": {"type": "string"},
        "branch": {"type": "string"},
        "commit_sha": {"type": "string"},
        "checks_passed": {"type": "boolean"},
        "files_changed": {"type": "array", "items": {"type": "string"}},
        "shared_change_requests": {"type": "array", "items": {"type": "string"}},
        "summary": {"type": "string"},
    },
    "required": ["feature", "branch", "checks_passed", "files_changed", "shared_change_requests", "summary"],
}

INTEGRATE_SCHEMA = {
    "type": "object",
    "properties": {
        "pr_url": {"type": "string"},
        "branch": {"type": "string"},
        "checks_passed": {"type": "boolean"},
        "check_output": {"type": "string"},
        "summary": {"type": "string"},
    },
    "required": ["pr_url", "branch", "checks_passed", "summary"],
}

REVIEW_SCHEMA = {
    "type": "object",
    "properties": {
        "fixed": {"type": "array", "items": {"type": "string"}},
        "remaining_gaps": {"type": "array", "items": {"type": "string"}},
        "screenshot_urls": {"type": "array", "items": {"type": "string"}},
        "checks_passed": {"type": "boolean"},
        "summary": {"type": "string"},
    },
    "required": ["fixed", "remaining_gaps", "checks_passed", "summary"],
}

FEATURE_SCOPE = {
    "layout": (
        "Layout: port `src/app/core/header`, `src/app/core/settings` (settings popup: open-links-in-new-tab, theme picker "
        "default/night/amoledblack, title font size, list spacing), and `src/app/core/footer` "
        "(templates, behavior incl. scroll-to-top on nav click and active-link styling, and SCSS) into `src/layout/`."
    ),
    "feed": (
        "Feed: port `src/app/feeds/feed` and `src/app/feeds/item` (story list for news/newest/show/ask/jobs, numbered items, "
        "pagination prev/more links, domain display, points/user/time/comments metadata, job items, open-in-new-tab setting, "
        "title font size and list spacing settings, loading and error states) into `src/features/feed/`."
    ),
    "item": (
        "Item details: port `src/app/item-details` (item page with title, metadata, text content, polls with option "
        "votes, recursive comments with collapse/expand toggle, deleted comments) and the `src/app/shared/pipes/comment.pipe.ts` "
        "logic into `src/features/item/`."
    ),
    "user": (
        "User: port `src/app/user` (profile page with id, created, karma, about HTML, loading and error states) into "
        "`src/features/user/`. Users must be fetched from `https://api.hnpwa.com/v0/user/{id}.json`."
    ),
}


def foundation_prompt():
    return f"""You are stage 1 (foundation) of a multi-agent migration of the GitHub repo {REPO} (an Angular 9 Hacker News PWA) to React.

{STACK}

{ENV_NOTES}

Task:
1. From `master`, create branch `{BASE}`.
2. Remove the Angular toolchain and app: angular.json, karma.conf.js, tslint.json, tsconfig.app.json, tsconfig.spec.json, ngsw-config.json, browserslist, e2e/, src/app/, src/main.ts, src/polyfills.ts, src/test.ts, src/environments/, yarn.lock, and Angular deps. Keep LICENSE, CONTRIBUTING, firebase files (Vite outputs to `dist`, matching firebase.json hosting).
3. Scaffold the target stack with a fresh package-lock.json. Move `src/manifest.json`, `src/favicon.ico` and `src/assets/**` (icons, images) so they are served at the same URLs as before (e.g. `public/`). Port `src/index.html` including its pre-bootstrap app-loader markup/CSS.
4. Port the shared layer (you own these paths; later agents will NOT edit them):
   - `src/models/` from `src/app/shared/models/*`.
   - `src/api/hackerNewsApi.ts` from `src/app/shared/services/hackernews-api.service.ts` (promise-based fetch: fetchFeed, fetchItemContent incl. poll option fetching and poll_votes_count, fetchUser via api.hnpwa.com) plus unit tests.
   - `src/settings/` : SettingsProvider + useSettings hook porting `settings.service.ts` (localStorage persistence, system prefers-color-scheme detection, theme, openLinkInNewTab, titleFontSize, listSpacing, showSettings toggle) plus tests.
   - `src/components/Loader` and `src/components/ErrorMessage` from `src/app/shared/components/*` (CSS Modules) plus tests.
   - `src/styles/` from `src/app/shared/scss/*` and `src/styles.scss` (global themes) and `src/app/app.component.scss`.
   - `src/App.tsx` + routes mirroring `src/app/app.routes.ts`: `/` -> redirect `/news/1`; `/:feedType/:page` for news|newest|show|ask|jobs; `/item/:id`; `/user/:id`; item and user pages lazy-loaded with React.lazy. App renders the theme wrapper (`<div className={{theme}}><div className="body-cover"/><div className="wrapper">header, outlet, footer</div></div>`) exactly like `app.component.html`.
   - Analytics: port the Google Analytics pageview-on-navigation behavior from `app.component.ts` if present.
5. Create placeholder (stub) components that compile and render a simple placeholder, one set per feature, each in a folder that a single later agent will own exclusively:
   - layout -> `src/layout/` (Header, Settings, Footer; App imports Header and Footer from here)
   - feed -> `src/features/feed/` (FeedPage route element)
   - item -> `src/features/item/` (ItemDetailsPage route element)
   - user -> `src/features/user/` (UserPage route element)
   App/routes must import ONLY the entry components from those folders, so each feature agent can fully replace its folder without touching shared files.
6. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` must all pass on Node 22. Commit and push `{BASE}` to origin. Do NOT open a PR.

Structured output: branch, commit_sha (HEAD you pushed), checks_passed, summary, and for each feature a `contract_<feature>` string telling that feature's agent exactly: which folder it owns, the stub file(s) and the exact export names/props it must keep, which shared hooks/APIs/models/components it should use (with import paths and signatures), and any conventions (test setup, CSS Module patterns, theme class names) it must follow.
"""


def feature_prompt(feature, contract, foundation):
    return f"""You are a feature agent in a multi-agent migration of the GitHub repo {REPO} from Angular 9 to React. The foundation is already done on branch `{BASE}` (commit {foundation.get('commit_sha', '')}). The original Angular source is on `master`; read it with `git show master:<path>` or a `git worktree`.

{STACK}

{ENV_NOTES}

Your feature: {FEATURE_SCOPE[feature]}

Contract from the foundation agent (follow it exactly):
{contract}

Rules:
- Branch `{BASE}-{feature}` from origin/{BASE}. Push only that branch. Do NOT open a PR. Do NOT merge anything.
- Edit ONLY files inside the folder your contract says you own. Four agents work in parallel on sibling folders and their branches will be merged together, so touching any other file (App.tsx, routes, src/api, src/models, src/settings, src/components, src/styles, package.json, lockfile) will cause conflicts. If you genuinely need a change outside your folder (e.g. a new npm dependency or an API helper), do not make it: describe it precisely in `shared_change_requests` and work around it locally if possible.
- Achieve functional and visual parity with the Angular component: same markup structure/class names where practical, same text, same behavior, and port its SCSS to CSS Modules (keep theme-dependent rules working with the global theme classes).
- Write Vitest + React Testing Library tests covering the main behaviors (mock fetch / the api module).
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` must pass on Node 22 before you push.

Structured output: feature (`{feature}`), branch, commit_sha, checks_passed, files_changed, shared_change_requests (empty list if none), summary.
"""


def integrate_prompt(foundation, features):
    return f"""You are the integration agent in a multi-agent migration of the GitHub repo {REPO} from Angular 9 to React. A foundation agent built branch `{BASE}` and four feature agents each pushed a branch off it.

{STACK}

{ENV_NOTES}

Foundation result:
{json.dumps(foundation, sort_keys=True, indent=2)}

Feature results (an entry with "failed": true means that agent produced nothing usable; implement that feature yourself in its folder by porting the Angular source from `master`, following its contract below):
{json.dumps(features, sort_keys=True, indent=2)}

Task:
1. Check out `{BASE}`. Merge each feature branch (`git merge --no-ff origin/<branch>`), resolving any conflicts.
2. Apply every item in `shared_change_requests` that is still needed.
3. Remove leftover stub/placeholder code. Make sure nothing Angular remains (deps, configs, rxjs, zone.js).
4. Update `.travis.yml` to Node 22 running `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` (keep the Firebase deploy on master). Update README for the React stack (dev/build/test commands).
5. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` on Node 22 and fix failures. Run `npm run preview` and smoke-check `/news/1`, `/item/<some id>`, `/user/pg` in a browser.
6. Push `{BASE}` and open ONE pull request from `{BASE}` into `master` titled "Migrate angular2-hn from Angular 9 to React (Vite + TypeScript)". Follow any org rules/skills for PRs. Description: stack, file layout, route map, offline/PWA approach, verification commands, notable decisions. Do NOT merge.

Structured output: pr_url, branch, checks_passed, check_output (last lines of the check commands), summary.
"""


def review_prompt(integration, round_index, previous):
    prev = ""
    if previous is not None:
        prev = ("\nA previous review round reported these remaining gaps; verify each and fix what you can:\n"
                + json.dumps(previous.get("remaining_gaps", []), sort_keys=True, indent=2) + "\n")
    return f"""You are parity-review round {round_index} for a migration of the GitHub repo {REPO} from Angular 9 to React. The React app is on branch `{BASE}`, PR: {integration.get('pr_url', '')}. The original Angular app is on `master`.

{ENV_NOTES}
{prev}
Task:
1. Run the React app from `{BASE}` (Node 22, `npm run dev -- --port 5173`).
2. Run the original Angular app from `master` as the reference: `git worktree add ../angular-ref master`, then in it `source ~/.nvm/nvm.sh && nvm use 12 && npm install && npm start` (serves :4200). If it cannot be made to run in ~10 minutes, use the Angular templates/SCSS on master as the reference instead and say so in the summary. Note: the Angular user page is broken because its user API is down; the React one should work.
3. Compare both in the browser, side by side, and check: header nav and active link, all 5 feeds (news/newest/show/ask/jobs) with pagination, a story item page with nested comments and collapse toggle, a poll item, a job item, the user page (`/user/pg`), all three themes (default/night/amoledblack) and the other settings (open in new tab, font size, list spacing) incl. persistence after reload, loading/error states, mobile width (~375px), and offline: after a first load, the production build (`npm run build && npm run preview`) still loads the app shell with the network disabled.
4. Fix every gap you find directly on `{BASE}` (small focused commits, keep CSS Modules), re-run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and push to `{BASE}`. Do not open a new PR and do not merge.
5. Take screenshots of the React app (feed in each theme, item page, user page; Angular vs React comparisons where useful), upload them, and post ONE comment on the PR summarizing what you checked, what you fixed and what remains, with the screenshots embedded.

Structured output: fixed (list), remaining_gaps (list, empty if full parity), screenshot_urls, checks_passed, summary.
"""


async def run_feature(feature, foundation):
    contract = foundation[f"contract_{feature}"]
    try:
        return await agent(
            feature_prompt(feature, contract, foundation),
            phase="features",
            schema=FEATURE_SCHEMA,
            label=f"feature-{feature}",
            repos=REPOS,
        )
    except WorkflowAgentError as e:
        log(f"feature {feature} failed: {e}")
        return {"feature": feature, "failed": True, "error": str(e), "contract": contract}


async def main():
    if BASE.startswith("CHANGE_ME"):
        raise RuntimeError("Set BASE to a fresh <datetime>-react-migration branch name first")
    await register_workflow({
        "name": "angular2-hn-react-migration",
        "description": "Migrate the angular2-hn Angular 9 PWA to React 18 + Vite + TypeScript: foundation, 4 parallel feature ports, integration PR, parity review.",
        "product": REPO,
        "phases": [
            {"title": "foundation", "detail": "Scaffold Vite/React, port shared layer, create per-feature stubs",
             "labels": ["foundation"], "soft_time_limit_minutes": TIMELIMITS["foundation"]},
            {"title": "features", "detail": "Port layout, feed, item details and user in parallel",
             "labels": [f"feature-{f}" for f in FEATURES], "soft_time_limit_minutes": TIMELIMITS["features"]},
            {"title": "integrate", "detail": "Merge feature branches, update CI/README, open the PR",
             "labels": ["integrate"], "soft_time_limit_minutes": TIMELIMITS["integrate"]},
            {"title": "review", "detail": "Side-by-side parity check vs Angular, fix gaps (max 2 rounds)",
             "soft_time_limit_minutes": TIMELIMITS["review"]},
        ],
    })

    log("stage 1: foundation")
    foundation = await agent(foundation_prompt(), phase="foundation", schema=FOUNDATION_SCHEMA,
                             label="foundation", repos=REPOS)
    if not foundation["checks_passed"]:
        raise RuntimeError(f"Foundation checks failed: {foundation['summary']}")
    log(f"foundation pushed {foundation['branch']} @ {foundation.get('commit_sha', '')}")

    log("stage 2: features")
    features = await parallel([(lambda f=f: run_feature(f, foundation)) for f in FEATURES])
    for r in features:
        log(f"feature {r.get('feature')}: failed={r.get('failed', False)} checks={r.get('checks_passed')} "
            f"requests={len(r.get('shared_change_requests', []))}")

    log("stage 3: integrate")
    integration = await agent(integrate_prompt(foundation, features), phase="integrate",
                              schema=INTEGRATE_SCHEMA, label="integrate", repos=REPOS)
    log(f"PR: {integration['pr_url']} checks={integration['checks_passed']}")

    log("stage 4: review")
    previous = None
    for round_index in (1, 2):
        try:
            review = await agent(review_prompt(integration, round_index, previous), phase="review",
                                 schema=REVIEW_SCHEMA, label=f"review-round-{round_index}", repos=REPOS)
        except WorkflowAgentError as e:
            log(f"review round {round_index} failed: {e}")
            break
        log(f"review {round_index}: fixed={len(review['fixed'])} remaining={len(review['remaining_gaps'])} "
            f"checks={review['checks_passed']}")
        if previous is not None and review["remaining_gaps"] == previous["remaining_gaps"]:
            log("no progress between rounds; stopping")
            previous = review
            break
        previous = review
        if not review["remaining_gaps"] and review["checks_passed"]:
            break

    log("RESULT " + json.dumps({
        "pr_url": integration["pr_url"],
        "integration_checks": integration["checks_passed"],
        "features": [{"feature": r.get("feature"), "failed": r.get("failed", False)} for r in features],
        "review": previous,
    }, sort_keys=True))


asyncio.run(main())
