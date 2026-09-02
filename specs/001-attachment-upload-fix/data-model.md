# Phase 1 Data Model: Attachment Upload Fix

This feature changes a configuration default and a UI interaction pattern; it does not add,
remove, or modify any persisted entity, field, or relationship. The domain entity and the one
configuration attribute it touches are documented below for completeness.

## Attachment (existing entity — unchanged)

Represents a file (photo or document) a clinician has uploaded to a patient's record via the
Attachments widget. Not modified by this feature; documented for context only.

| Field | Description |
|---|---|
| `fileName` | User-provided display name for the attachment (sanitized against `allowedFileExtensions`). |
| `fileDescription` | Optional caption/description, collected only for image attachments when configured. |
| `fileType` | `image` \| `pdf` \| other, derived from the uploaded file. |
| `base64Content` | Encoded file content submitted to the Attachments REST API. |

**Validation rules** (existing, referenced by this feature):
- File size MUST NOT exceed the configured `maxFileSize` (see below) — enforced client-side
  before upload (FR-006).
- `fileName` MUST be non-empty after trimming (existing `zod` schema in
  `file-review.component.tsx`; unchanged).

## AttachmentsConfig.maxFileSize (existing config attribute — value changed)

The one configuration attribute this feature modifies, defined in
`attachments-config-schema.ts`.

| Field | Before | After |
|---|---|---|
| Type | `Number` (MB) | `Number` (MB) — unchanged |
| Default | `1` | `10` (FR-004) |
| Validator | `> 0` | `> 0` — unchanged |
| Implementer override | Supported, takes precedence over default | Supported, unchanged (FR-005) |

No state transitions apply — this is a single scalar configuration value with no lifecycle.
