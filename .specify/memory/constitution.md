<!--
Sync Impact Report
- Version change: (unratified template) → 1.0.0
- Rationale: Initial ratification. The prior file was the unmodified scaffold (all
  placeholders unfilled); this is the first concrete adoption, derived from the project's
  actual conventions (package.json scripts, turbo.json, lint-staged.config.mjs,
  .github/pull_request_template.md, .github/workflows/ci.yml, and commit history).
- Modified principles: n/a (initial adoption)
- Added sections:
  - Core Principles: I. Microfrontend Modularity, II. Design-Driven UI, III. Test
    Coverage Required, IV. Internationalization by Default, V. Non-Negotiable Quality
    Gates, VI. Conventional Commits & Traceability
  - Technology Stack & Architecture Constraints
  - Development Workflow & Quality Gates
  - Governance
- Removed sections: none
- Deferred items:
  - TODO(RATIFICATION_DATE): No original adoption date is recorded anywhere in the
    repository (no CONTRIBUTING.md, no prior constitution content, no dated governance
    doc). A maintainer should supply the true original date if one exists, otherwise this
    should be treated as the ratification date once confirmed.
-->

# OpenMRS ESM Patient Chart Constitution

## Core Principles

### I. Microfrontend Modularity
Each `packages/*` workspace is a self-contained, independently buildable and independently
deployable ESM microfrontend (or a cross-cutting library such as `esm-patient-common-lib`).
Widgets MUST register with the host application only through the extension/registration
system exposed by `@openmrs/esm-framework` (extensions, extension slots, dashboards) —
never by reaching into another widget's internals, private state, or non-exported modules.
Shared logic that multiple widgets need MUST be lifted into a common lib rather than
duplicated or cross-imported between widget packages.
Rationale: this repo ships dozens of widgets that different implementers mix and match into
distributions; tight coupling between packages breaks that composability and makes
independent versioning/publishing (`ci:publish`, `release`) unsafe.

### II. Design-Driven UI
UI work MUST be based on an approved design (linked in the Jira ticket or PR description)
and MUST follow the OpenMRS design system (Carbon Design System components/patterns,
per the [styleguide](http://om.rs/o3ui)). PRs that change UI MUST include before/after
screenshots. Ad hoc, undesigned UI changes are not acceptable for anything user-facing.
Rationale: this is the exact bar already enforced by
`.github/pull_request_template.md` ("My work is based on designs... See also:
Styleguide"); consistency across widgets built by different contributors depends on it.

### III. Test Coverage Required
Every behavioral change MUST include new tests or be validated by existing tests. Unit and
component tests use Vitest (`turbo run test`); cross-widget and user-facing flows are
covered by Playwright end-to-end tests under `e2e/`. A PR that changes behavior with no
accompanying or pre-existing test coverage is incomplete.
Rationale: matches the PR template requirement ("My work includes tests or is validated by
existing tests") and the `verify` script, which treats `test` as a merge gate alongside
lint and typecheck.

### IV. Internationalization by Default
All user-facing strings MUST be externalized through i18next translation keys — never
hardcoded UI text. New or changed keys MUST be extractable via the
`extract-translations` task. Translation content itself is owned by Transifex and flows
back in as automated `(chore) Update translations from Transifex` commits; do not hand-edit
translated strings in application code outside of the source (English) key/value.
Rationale: this repo ships to a global, multi-language implementer base; translation is
already a first-class, automated pipeline (`i18next-parser`, scheduled Transifex sync
commits), and hardcoded text silently breaks it.

### V. Non-Negotiable Quality Gates
Code MUST pass, with zero tolerance for skipping: ESLint with `--max-warnings 0`, Prettier
formatting, and TypeScript type-checking. These run locally via Husky/`lint-staged` on
commit and are re-verified in CI via `yarn verify` (`turbo run lint typescript test`),
which gates every PR before merge. Do not bypass these with `--no-verify`, disabled rules,
or `@ts-ignore` used to silence a real error rather than document an intentional escape
hatch.
Rationale: these are already wired as hard gates (`lint-staged.config.mjs`,
`turbo.json` `verify` pipeline, OpenMRS CI `verify_command: yarn verify`); the constitution
makes explicit that they are not optional or negotiable per-PR.

### VI. Conventional Commits & Traceability
Commit and PR titles MUST use a conventional-commit type label (e.g. `(feat)`, `(fix)`,
`(chore)`, `(BREAKING)`) and, when a Jira ticket exists, MUST include its ticket number
(e.g. `O3-5908`) so history stays traceable back to the tracked work item. Follow the
pattern already established in this repo's history: `(type) [O3-NNNN: ]Description
(#PR)`.
Rationale: required by the PR template ("include a conventional commit label... reference
the ticket number") and is what makes changelog generation and issue traceability
possible across a monorepo with frequent, high-volume merges.

## Technology Stack & Architecture Constraints

- Monorepo managed with Yarn workspaces (`packages/*`) and orchestrated with Turborepo
  (`turbo.json`); prefer `turbo run <task> --filter=<package>` over ad hoc per-package
  scripting so caching and dependency ordering are respected.
- Widgets are built on `@openmrs/esm-framework` and `single-spa`; UI is React + TypeScript.
- Dependency version overrides in the root `package.json` `resolutions` field MUST include
  an inline comment in the README (or equivalent) explaining why the override exists and a
  tracking issue link, and MUST be removed once the upstream fix lands (see the `dompurify`
  override in [README.md](../../README.md) as the pattern to follow).
- Do not introduce a new state-management, styling, or component library without a
  documented reason — the existing stack (Carbon, i18next, React Hook Form + Zod,
  `@openmrs/esm-framework` APIs) is the default for all new work.

## Development Workflow & Quality Gates

- Every PR must satisfy the checklist in `.github/pull_request_template.md`: a
  ticket-referencing, conventional-commit-labeled title; design linkage for UI changes with
  screenshots; and test coverage.
- CI (`OpenMRS CI` workflow) runs `yarn verify` (lint + typescript + test) on every PR
  against `main`; a PR MUST NOT be merged with a red or skipped CI run.
- Local commits go through Husky-managed `lint-staged` (ESLint `--fix --max-warnings 0`,
  Prettier) before they can land — do not commit with `--no-verify`.
- Breaking changes to a published package's public API MUST be labeled `(BREAKING)` in the
  PR/commit title and called out explicitly in the PR description, since downstream
  distributions consume these packages independently via `ci:publish`.

## Governance

This constitution supersedes ad hoc conventions for anything it covers. Where it is silent,
defer to the [OpenMRS 3 Frontend Developer Documentation](https://openmrs.atlassian.net/wiki/x/IABBHg)
and existing patterns in the codebase.

**Amendment procedure**: propose changes to `.specify/memory/constitution.md` via a normal
PR, labeled `(docs)`, describing the change and rationale in the PR body; it requires the
same review as any other change to shared tooling/config. On merge, update the version per
the policy below and record the change in the Sync Impact Report comment at the top of this
file.

**Versioning policy** (semantic versioning applied to this document):
- MAJOR: backward-incompatible governance changes — removing or redefining a principle in a
  way that invalidates prior compliant work.
- MINOR: a new principle or materially expanded guidance added.
- PATCH: clarifications, wording, or non-semantic fixes.

**Compliance review**: reviewers should treat this document as part of the PR checklist —
a PR that knowingly violates a principle here (skipped tests, undesigned UI, disabled lint
rules, non-conventional commit title) should not be approved without an explicit,
documented justification in the PR description.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2026-09-02
