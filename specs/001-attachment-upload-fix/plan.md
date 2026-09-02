# Implementation Plan: Attachment Upload Fix

**Branch**: `001-attachment-upload-fix` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-attachment-upload-fix/spec.md`

## Summary

The "Add attachment" review step in the Attachments widget currently (1) rejects files over a
1MB default (`maxFileSize`), and (2) places its only submit control (`Add attachment` button)
in a `ModalFooter` that scrolls out of view on small mobile viewports once the on-screen
keyboard opens after the auto-focused caption field is tapped — leaving Android users with no
way to complete an upload. The fix: raise the default `maxFileSize` config value to 10MB
(implementer overrides still respected), and make the modal footer containing the submit
control stick to the bottom of the visible viewport (CSS `position: sticky`) so it stays
reachable regardless of keyboard state, with no change to the existing desktop Enter-to-submit
behavior.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18 (existing monorepo stack; no version change)

**Primary Dependencies**: `@carbon/react` (`Form`, `ModalBody`, `ModalFooter`, `Button`),
`@openmrs/esm-framework` (`useConfig`, `showModal`, `UserHasAccess`), `react-hook-form` + `zod`
(existing form/validation stack in `file-review.component.tsx`) — no new dependencies

**Storage**: N/A — attachments are persisted via the existing OpenMRS Attachments REST API; this
feature changes a config default and a UI layout, not storage or the upload API contract

**Testing**: Vitest (component tests, `packages/esm-patient-attachments-app`), Playwright (e2e,
`e2e/specs`) — per constitution Principle III

**Target Platform**: Web SPA (OpenMRS single-spa microfrontend), responsive; must remain correct
on both desktop and small mobile viewports (notably Android, per the source issue)

**Project Type**: Existing frontend monorepo package (`packages/esm-patient-attachments-app`) —
no new project/package created

**Performance Goals**: No explicit throughput target; the change must not introduce visible
render jank when the sticky footer engages/disengages, and must not materially slow modal open
time

**Constraints**:
- Must preserve existing desktop "Enter submits the form" behavior unchanged (FR-003)
- Must continue to let implementers override `maxFileSize` via config, taking precedence over
  the new platform default (FR-005)
- Must pass constitution Principle V gates: ESLint `--max-warnings 0`, Prettier, TypeScript,
  `yarn verify` in CI
- Any new/changed user-facing copy must go through i18next (Principle IV) — expected to be
  none, since the existing size-limit error message already interpolates the configured value

**Scale/Scope**: Single package, two files with behavioral changes
(`attachments-config-schema.ts`, `file-review.component.tsx` + its stylesheet), plus the
matching test updates; no cross-package or cross-widget changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Microfrontend Modularity | PASS | Change is fully contained to `packages/esm-patient-attachments-app`; no other widget is touched, and nothing here reaches into another package's internals. |
| II. Design-Driven UI | PASS (with note) | This is a defect fix, not a new visual design — the sticky footer treatment reuses existing Carbon `ModalFooter`/`Button` styling with no new visual language. Per the PR template, the implementing PR must still include before/after screenshots (desktop + mobile-with-keyboard-open) even though no new mockup exists to link. |
| III. Test Coverage Required | PASS | Plan adds/updates Vitest component tests (size-limit rejection/acceptance, footer visibility class/behavior) and a Playwright e2e scenario at a mobile viewport per FR-001–FR-003 and SC-001/SC-003. |
| IV. Internationalization by Default | PASS | No new user-facing strings are anticipated; the existing size-limit error message already interpolates the configured `maxFileSize` value via i18next, so only the numeric default changes. |
| V. Non-Negotiable Quality Gates | PASS | Standard `yarn verify` (lint + typecheck + test) gate applies; no exceptions requested. |
| VI. Conventional Commits & Traceability | PASS | Implementation PR/commit will use a `(fix)` label and reference GitHub issue pontmedical/openmrs-esm-patient-chart#1 in the title/description (no Jira ticket exists for this GitHub-originated issue). |

No violations requiring justification — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-attachment-upload-fix/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/esm-patient-attachments-app/
├── src/
│   ├── attachments-config-schema.ts               # maxFileSize default: 1 → 10 (FR-004, FR-005)
│   ├── attachments-config-schema.test.ts           # (new/updated) default-value regression test
│   └── camera-media-uploader/
│       ├── file-review.component.tsx               # submit control reachability (FR-001–FR-003)
│       ├── file-review.scss                        # sticky ModalFooter treatment
│       ├── file-review.test.tsx                     # (updated) component tests
│       ├── media-uploader.component.tsx             # size validation against maxFileSize (FR-006)
│       └── media-uploader.test.tsx                   # (existing) size-limit test, updated for new default

e2e/
└── specs/
    └── attachments/                                 # (existing area) add a mobile-viewport
                                                       # scenario covering FR-001/FR-002/SC-001
```

**Structure Decision**: This is a defect-fix feature inside the existing
`packages/esm-patient-attachments-app` frontend package within the monorepo — no new package,
service, or project is created. Changes are scoped to the attachment upload/review components,
their stylesheet, and the config schema, with matching Vitest and Playwright coverage in their
existing locations.

## Complexity Tracking

*No entries — Constitution Check reported no violations.*
