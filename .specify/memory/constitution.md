<!--
Sync Impact Report
==================
Version change: (template) → 1.0.0
Bump rationale: Initial ratification of the project constitution (MAJOR baseline).
Modified principles: n/a (first version)
Added principles:
  - I. Mandatory Stack
  - II. Existing Structure First
  - III. Client-Side Persistence via Services
  - IV. English-Only (en-US) Everywhere
  - V. Tests Ship With Every Feature
Added sections:
  - Technology & Architecture Constraints
  - Development Workflow & Quality Gates
Removed sections: none
Templates reviewed:
  - .specify/templates/plan-template.md ...... ✅ aligns (Constitution Check gate present)
  - .specify/templates/spec-template.md ...... ✅ aligns (no conflicting mandatory sections)
  - .specify/templates/tasks-template.md ..... ✅ aligns (test tasks supported by Principle V)
Follow-up TODOs: none
-->

# angular2-hn Constitution

## Core Principles

### I. Mandatory Stack
All new work MUST use the existing stack: **Angular 9, TypeScript, SCSS, and RxJS**.
Contributors MUST NOT introduce a different framework, an alternative styling system,
or a competing state/async library. New third-party dependencies MUST be justified and
kept minimal to preserve the app's performance and PWA characteristics.
Rationale: angular2-hn is a maintained, performance-tuned Angular 9 Hacker News PWA;
stack drift would fracture the build, the AOT/Workbox pipeline, and reviewability.

### II. Existing Structure First
New features MUST follow the established module/component structure — `feeds`, `core`,
and `shared` — and MUST reuse existing components, pipes, and models (e.g. `ItemComponent`)
rather than duplicating them. Routing changes MUST extend `app.routes.ts` in the current style.
Rationale: consistency with the current architecture keeps the codebase navigable and
lets the Plan phase build on real, existing files instead of reinventing them.

### III. Client-Side Persistence via Services
Persistent state MUST be stored client-side in `localStorage`, accessed through an
Angular service that mirrors the existing `SettingsService` pattern. Features MUST NOT
introduce a backend, remote database, or server-side session for persistence.
Rationale: the app is a static, offline-capable PWA with no application backend;
service-encapsulated `localStorage` matches the current design and stays testable.

### IV. English-Only (en-US) Everywhere
All code, identifiers, comments, documentation, logs, and user-visible UI text MUST be
written in **English (en-US)**. No other locale may appear in shipped output.
Rationale: a single, enforced locale prevents the "surprise foreign string" class of
bugs and keeps the UI and codebase consistent for reviewers and users.

### V. Tests Ship With Every Feature (NON-NEGOTIABLE)
Every new feature MUST ship with unit tests. New services and non-trivial logic MUST have
Karma/Jasmine specs, and test coverage MUST NOT regress as features are added.
Rationale: tests are the guardrail that keeps agent-written and human-written changes
trustworthy and prevents coverage gaps from widening over time.

## Technology & Architecture Constraints

- **Language & tooling**: Angular 9 + TypeScript; styles in SCSS; async/data flow via RxJS.
- **Build**: features MUST build cleanly with `ng build`; the AOT/Workbox/PWA pipeline
  MUST remain functional.
- **Persistence**: `localStorage` only, behind a service; no backend or external datastore.
- **Structure**: respect `feeds` / `core` / `shared`; extend routing via `app.routes.ts`.
- **Dependencies**: prefer reuse over new packages; any new dependency MUST be justified.

## Development Workflow & Quality Gates

- **Spec-Driven flow**: features proceed through Constitution → Specify → (Clarify) → Plan
  → Tasks → Implement; each phase MUST respect this constitution.
- **Constitution Check**: the Plan phase MUST verify the design honors every principle
  above before implementation begins.
- **Test gate**: unit tests for new logic MUST exist and pass (`ng test`) before a feature
  is considered done; coverage MUST NOT decrease.
- **Locale gate**: reviewers MUST confirm all shipped strings and code are en-US.
- **Build gate**: `ng build` MUST succeed prior to merge.

## Governance

This constitution supersedes ad-hoc conventions for new work in angular2-hn. All plans,
tasks, and implementations MUST verify compliance with the principles above; any deviation
MUST be justified in the relevant spec/plan and approved during review.

Amendments MUST be made by editing this file, recorded in the Sync Impact Report, and
versioned using semantic versioning:
- **MAJOR**: backward-incompatible governance/principle removals or redefinitions.
- **MINOR**: a new principle/section is added or guidance is materially expanded.
- **PATCH**: clarifications, wording, or non-semantic refinements.

Compliance is reviewed at each Spec Kit gate; downstream templates
(`plan-template.md`, `spec-template.md`, `tasks-template.md`) MUST stay consistent with
this document.

**Version**: 1.0.0 | **Ratified**: 2026-07-20 | **Last Amended**: 2026-07-20
