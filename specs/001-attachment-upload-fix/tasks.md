# Tasks: Attachment Upload Fix

**Input**: Design documents from `/specs/001-attachment-upload-fix/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/attachments-config.md](./contracts/attachments-config.md), [quickstart.md](./quickstart.md)

**Tests**: Included — constitution Principle III ("Test Coverage Required") mandates test coverage for every behavioral change in this repo, so test tasks are not optional here.

**Organization**: Tasks are grouped by user story so each can be implemented, tested, and delivered independently.

## Path Conventions

Existing monorepo package: `packages/esm-patient-attachments-app/src/...` (component tests are colocated, e.g. `<name>.component.test.tsx` next to `<name>.component.tsx`, matching `attachment-preview.component.test.tsx`). E2E specs live in `e2e/specs/`, page objects in `e2e/pages/`.

---

## Phase 1: Setup

**Purpose**: Establish a known-good baseline before making changes.

- [X] T001 Run `yarn turbo run test --filter=@openmrs/esm-patient-attachments-app` and `yarn verify` to confirm the existing suite is green before any changes, so later failures are attributable to this feature's changes.

**Checkpoint**: Baseline confirmed green.

---

## Phase 2: Foundational

**None required.** User Story 1 and User Story 2 touch disjoint files (`camera-media-uploader/file-review.*` vs. `attachments-config-schema.ts` / `camera-media-uploader/media-uploader.*`), and no new shared infrastructure, dependency, or abstraction is introduced by this feature. Proceed directly to the user story phases.

---

## Phase 3: User Story 1 - Mobile submit control stays reachable (Priority: P1) 🎯 MVP

**Goal**: On small mobile viewports, the "Add attachment" submit control in the review/caption step remains visible and usable even when the on-screen keyboard is open, without regressing the existing desktop Enter-to-submit behavior.

**Independent Test**: On a mobile-width viewport with the on-screen keyboard open (caption field focused), confirm the "Add attachment" button is visible and tappable, and completes the upload; on a desktop-width viewport, confirm pressing Enter in the caption field still submits.

### Tests for User Story 1 ⚠️

> Write these tests first; confirm they fail before implementing.

- [X] T002 [P] [US1] Write a Vitest component test in `packages/esm-patient-attachments-app/src/camera-media-uploader/file-review.component.test.tsx` (new file) asserting: (a) the `ModalFooter` containing the "Add attachment" button carries the new sticky-footer style/class so it stays visible independent of body scroll position, and (b) pressing Enter while focused in the caption `TextInput` still submits the form (FR-003 regression guard).
- [X] T003 [P] [US1] Add a Playwright e2e scenario to `e2e/specs/attachments.spec.ts`, using a mobile viewport (e.g. a mobile Playwright project/context), that focuses the caption field after selecting a file and asserts the "Add attachment" button (`page.getByRole('button', { name: /add attachment/i })`) remains visible without scrolling, then clicks it and asserts successful upload — extending the existing `AttachmentsPage` page object in `e2e/pages/attachments-page.ts` if a helper is needed. **Written but not executed** — no live OpenMRS backend was available in this environment to run Playwright against; run `yarn test-e2e attachments` against a real/dev3 backend before merging.

### Implementation for User Story 1

- [X] T004 [US1] In `packages/esm-patient-attachments-app/src/camera-media-uploader/file-review.scss`, add a sticky-footer rule (`position: sticky; bottom: 0;` plus a solid background so content doesn't show through) for the modal footer, per the approach documented in [research.md](./research.md#decision-1-keep-the-submit-control-reachable-via-a-sticky-modal-footer). *(Depends on: T002)*
- [X] T005 [US1] In `packages/esm-patient-attachments-app/src/camera-media-uploader/file-review.component.tsx`, apply the new sticky-footer class to the `<ModalFooter>` element, and ensure the modal body wrapper has a bounded, independently scrollable container (so the sticky footer has a scrolling ancestor to stick within). *(Depends on: T004)*
- [ ] T006 [US1] Manually validate on an Android device or emulator, per [quickstart.md](./quickstart.md#3-validate-mobile-submit-reachability-user-story-1--fr-001fr-003-sc-001), that the submit button stays reachable with the on-screen keyboard open. *(Depends on: T005)* — **Not performed**: no Android device/emulator or live backend available in this environment. This remains an open item before merging (see Completion Report).

**Checkpoint**: User Story 1 is independently functional — mobile users can always reach and use the submit control; desktop Enter-to-submit is unchanged.

---

## Phase 4: User Story 2 - Realistic file size limit (Priority: P2)

**Goal**: The default maximum attachment file size is raised from 1MB to 10MB, so typical modern phone-camera photos and scanned documents are accepted, while implementer-configured overrides continue to take precedence.

**Independent Test**: Upload a file between 1MB and 10MB and confirm it's accepted (previously rejected); upload a file over 10MB and confirm it's rejected with an error stating the 10MB limit; with an implementer override set, confirm that value is enforced instead.

### Tests for User Story 2 ⚠️

> Write these tests first; confirm they fail before implementing.

- [X] T007 [P] [US2] Write Vitest component tests in `packages/esm-patient-attachments-app/src/camera-media-uploader/media-uploader.component.test.tsx` (new file) asserting: (a) a file just under 10MB is accepted, (b) a file just over 10MB is rejected and the error message states the 10MB limit (FR-006), and (c) with `useConfig` mocked to return a custom `maxFileSize` (e.g. `2`), that custom limit is enforced instead of the default (FR-005) — per the contract in [contracts/attachments-config.md](./contracts/attachments-config.md). Also added `packages/esm-patient-attachments-app/src/attachments-config-schema.test.ts` (not in the original task list) to directly assert the schema's real `_default` value, since the component tests above only exercise mocked `useConfig` values and never touch the actual default.

### Implementation for User Story 2

- [X] T008 [US2] In `packages/esm-patient-attachments-app/src/attachments-config-schema.ts`, change `maxFileSize._default` from `1` to `10` so the tests in T007 pass (FR-004). *(Depends on: T007)*

**Checkpoint**: User Stories 1 AND 2 both work independently — realistic files are accepted by default, and the submit control is always reachable on mobile.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Constitution-required wrap-up before this feature is PR-ready.

- [X] T009 [P] Run `yarn verify` (lint `--max-warnings 0`, typecheck, test) across the repo to confirm constitution Principle V quality gates pass with both stories implemented. **70/70 tasks passed** (all packages).
- [ ] T010 [P] Capture before/after screenshots (desktop review step, and mobile with the on-screen keyboard open) for the PR description, satisfying constitution Principle II and the `.github/pull_request_template.md` checklist. **Not performed**: requires a running dev server and browser/device screenshots, not available in this environment.
- [ ] T011 Open the PR with a `(fix)` conventional-commit-labeled title referencing GitHub issue `pontmedical/openmrs-esm-patient-chart#1`, per constitution Principle VI (no Jira ticket exists for this GitHub-originated issue). **Not performed** — left for the user to open when ready.
- [ ] T012 Walk through [quickstart.md](./quickstart.md) end-to-end (both the size-limit and mobile-reachability sections) to confirm SC-001 through SC-004 are met together, not just per-story. **Partially performed**: the automated portions (component/unit tests, `yarn verify`) were run; the manual mobile-device and e2e-against-a-live-backend portions were not (see T003/T006).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: None required (see above) — proceed straight to user stories after Setup.
- **User Story 1 (Phase 3)**: Depends only on Setup (T001). No dependency on User Story 2.
- **User Story 2 (Phase 4)**: Depends only on Setup (T001). No dependency on User Story 1.
- **Polish (Phase 5)**: Depends on both user stories being complete (T006 and T008).

### User Story Dependencies

- **User Story 1 (P1)**: Independent — touches `camera-media-uploader/file-review.*` and `e2e/specs/attachments.spec.ts` only.
- **User Story 2 (P2)**: Independent — touches `attachments-config-schema.ts` and `camera-media-uploader/media-uploader.component.test.tsx` only.
- The two stories can be implemented in either order, or in parallel by different people, with no integration step between them.

### Within Each User Story

- Tests (T002/T003, T007) MUST be written and failing before their corresponding implementation tasks (T004–T005, T008).

### Parallel Opportunities

- T002 and T003 (US1 tests, different files) can run in parallel.
- T007 has no sibling test task to parallelize against, but is independent of all US1 tasks and can run in parallel with T002/T003.
- T009 and T010 (Polish) can run in parallel.
- User Story 1 (T002–T006) and User Story 2 (T007–T008) can be worked entirely in parallel by two people, since they share no files.

---

## Parallel Example: Both User Stories

```bash
# After T001 (baseline check), launch both stories' test tasks together:
Task: "Write file-review.component.test.tsx sticky-footer + Enter-key regression test (T002)"
Task: "Add mobile-viewport Playwright scenario to attachments.spec.ts (T003)"
Task: "Write media-uploader.component.test.tsx size-limit and override tests (T007)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 3: User Story 1 (T002–T006) — this alone fixes the total blocker (no way to submit on affected mobile devices).
3. **STOP and VALIDATE**: Confirm User Story 1 independently via its Independent Test above.
4. Ship as the MVP increment if desired before tackling the file-size limit.

### Incremental Delivery

1. Setup (T001) → baseline confirmed.
2. User Story 1 (T002–T006) → mobile submit reachability fixed → validate → ship (MVP).
3. User Story 2 (T007–T008) → file size limit raised → validate → ship.
4. Polish (T009–T012) → quality gates, screenshots, PR, full quickstart pass.

### Parallel Team Strategy

With two contributors: one takes User Story 1 (T002–T006), the other takes User Story 2 (T007–T008), both starting right after T001; they converge only at Polish (Phase 5).

---

## Notes

- [P] tasks touch different files and have no incomplete dependency.
- [US1]/[US2] labels map each task to its user story for traceability back to [spec.md](./spec.md).
- Both stories are already independently testable and deliverable — no artificial dependency was introduced between them.
- Commit after each task or logical group, using `(fix)` per constitution Principle VI.
