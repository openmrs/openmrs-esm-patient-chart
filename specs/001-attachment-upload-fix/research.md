# Phase 0 Research: Attachment Upload Fix

All `[NEEDS CLARIFICATION]` markers were already resolved during `/speckit-specify` (default
max file size = 10MB, chosen by the user). The research below covers implementation-approach
decisions needed to satisfy the spec's functional requirements — no further clarification with
the user is required.

## Decision 1: Keep the submit control reachable via a sticky modal footer

**Decision**: Make the `ModalFooter` in `file-review.component.tsx` stick to the bottom of the
modal's visible area (CSS `position: sticky; bottom: 0;` on the footer, with the modal body
remaining independently scrollable), rather than repositioning it with JavaScript.

**Rationale**: The root cause (per code inspection of `file-review.component.tsx` and
`file-review.scss`) is that `ModalFooter` sits in normal document flow below an
`autoFocus`-ed `TextInput`; when a mobile on-screen keyboard opens, the visible viewport
shrinks and the footer is pushed below the fold with no built-in way back into view. A
CSS-only sticky footer is a well-established fix for exactly this class of problem, requires no
new dependency, works consistently across the mobile browsers OpenMRS already targets (including
older Android WebViews with limited `visualViewport` API support), and needs no client-side
resize-event handling that could introduce jank or edge-case bugs.

**Alternatives considered**:
- **`window.visualViewport` resize listener repositioning the modal/footer via JS**: rejected —
  adds runtime complexity and event-listener lifecycle management for a problem CSS already
  solves; `visualViewport` support is inconsistent on the lower-end/older Android devices this
  project explicitly needs to support (per the source issue).
- **Auto-scroll the caption field into view on focus (`scrollIntoView`)**: rejected as the
  primary fix — it addresses the input field's visibility, not the submit button's, so the user
  would still need to dismiss the keyboard or scroll further to reach "Add attachment."
- **Move the submit button above the fold (e.g., next to the header)**: rejected — breaks the
  established Carbon modal convention (primary actions in the footer) and would be a larger,
  less consistent UI change than necessary for a defect fix (constitution Principle II).

## Decision 2: Raise `maxFileSize` default from 1 to 10 (MB)

**Decision**: Change `_default: 1` to `_default: 10` in
`packages/esm-patient-attachments-app/src/attachments-config-schema.ts`. No change to the
config schema's shape, type, or validator.

**Rationale**: Matches spec FR-004, per the user's explicit choice (10MB) during
`/speckit-specify`. 10MB comfortably covers typical modern phone-camera photos (commonly
2-8MB) and multi-page scanned documents, while remaining a conservative-enough default not to
meaningfully change storage/bandwidth assumptions for existing deployments that haven't
overridden the value.

**Alternatives considered**: 5MB (rejected as still tight for higher-resolution phone photos —
the exact complaint in the source issue) and 25MB (rejected as an unnecessarily large default
for the common case; deployments that need more can already override `maxFileSize`, per
FR-005/existing behavior).

## Decision 3: No new user-facing strings

**Decision**: Make no changes to translation keys or copy.

**Rationale**: Code inspection of `media-uploader.component.tsx` confirms the existing
size-limit error message already interpolates the configured `maxFileSize` value (i.e., it
reads "Size limit is {{fileSize}}MB" from the live config, not a hardcoded "1MB" string), so
raising the default requires no copy change and stays i18next-compliant (constitution
Principle IV) with zero new keys to extract or translate.

**Alternatives considered**: n/a — confirmed via source inspection, not a judgment call.
