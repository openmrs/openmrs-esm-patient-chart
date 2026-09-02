# Feature Specification: Attachment Upload Fix

**Feature Branch**: `001-attachment-upload-fix`

**Created**: 2026-09-02

**Status**: Draft

**Input**: User description: "The feature is described in this git issue: Attachment uploads: 1MB file size limit and unreachable submit button on mobile #1 (pontmedical/openmrs-esm-patient-chart#1)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete an attachment upload on a mobile device (Priority: P1)

A clinician using a phone (particularly Android) opens the "Add attachment" flow in the patient chart, selects or captures a photo, types a caption, and needs a way to submit the upload that doesn't depend on pressing "Enter" on a keyboard that doesn't offer one in this context.

**Why this priority**: Today this flow can be a complete dead end on affected devices — there is no way to finish the upload at all. This is the more severe of the two problems because it fully blocks task completion rather than just narrowing what's allowed.

**Independent Test**: On a small mobile viewport with an on-screen keyboard open (e.g. after tapping into the caption field), confirm the submit control for the attachment is visible and can be tapped to complete the upload, without needing to dismiss the keyboard or scroll to find it.

**Acceptance Scenarios**:

1. **Given** a clinician has selected a photo and opened the caption/review step on a small mobile viewport, **When** they tap into the caption field and the on-screen keyboard opens, **Then** the submit control remains visible and reachable on screen.
2. **Given** the submit control is visible, **When** the clinician taps it, **Then** the attachment is uploaded and attached to the patient's record, same as the existing desktop flow.
3. **Given** a clinician on desktop is in the same review step, **When** they press "Enter" in the caption field, **Then** the attachment is submitted as it is today (no regression to existing desktop behavior).

---

### User Story 2 - Upload a realistically-sized photo or document (Priority: P2)

A clinician selects a photo (e.g. taken on a modern phone camera) or a scanned document to attach to a patient's record, and the file is accepted rather than being rejected for exceeding an overly small size limit.

**Why this priority**: This narrows what can be uploaded at all, but unlike User Story 1 it isn't a total dead end — some files still get through, and the current error message at least tells the user why. It's still a significant, frequent barrier to a routine clinical task.

**Independent Test**: Attempt to upload a photo file whose size is representative of a typical modern phone camera photo and confirm it is accepted (previously it would have been rejected under the 1MB default).

**Acceptance Scenarios**:

1. **Given** a clinician selects a photo file larger than 1MB but within the new default limit, **When** they proceed through the add-attachment flow, **Then** the file is accepted and uploaded successfully.
2. **Given** a clinician selects a file that still exceeds the (now higher) configured limit, **When** they attempt to add it, **Then** they see a clear error message stating the current limit, consistent with today's error behavior.
3. **Given** an implementer has configured a custom file size limit for their deployment, **When** a clinician uploads a file within that custom limit, **Then** the file is accepted regardless of the platform default.

---

### Edge Cases

- What happens when a file is exactly at the size limit boundary? (Should be accepted; limit is "greater than," not "greater than or equal to," matching current validation behavior.)
- What happens when the on-screen keyboard is open and the viewport is extremely small (e.g. landscape orientation on a phone)? The submit control must still be reachable.
- What happens if a clinician submits via the visible button while a file is still uploading/processing? The system should not allow duplicate submissions (consistent with existing submit-in-progress handling, if any).
- What happens when an implementer has already customized `maxFileSize` in their deployment config? The new platform default must not override an explicit implementer configuration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The add-attachment review step MUST present a submit control that is visible and reachable on small (mobile) viewports at all times during caption entry, including while an on-screen keyboard is open.
- **FR-002**: Users MUST be able to complete an attachment upload by interacting directly with a visible submit control, without relying on a keyboard "Enter"/submit key.
- **FR-003**: The existing desktop behavior of submitting via the "Enter" key MUST continue to work unchanged.
- **FR-004**: The default maximum attachment file size MUST be raised from 1MB to 10MB to accommodate typical modern phone camera photos and scanned documents.
- **FR-005**: Implementers MUST still be able to override the maximum file size via existing configuration, and an explicit implementer-configured value MUST take precedence over the new platform default.
- **FR-006**: When a selected file exceeds the configured maximum size, the system MUST reject it and show a clear, user-facing error message stating the current limit (preserving today's error behavior with the updated default value).

### Key Entities

- **Attachment**: A file (photo or document) a clinician uploads to a patient's chart, subject to a maximum size limit that is configurable per deployment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a small mobile viewport, a user can locate and use the submit control to complete an attachment upload in under 10 seconds from opening the caption/review step, without scrolling or dismissing the keyboard.
- **SC-002**: The share of attempted photo/document uploads rejected solely for exceeding the size limit drops significantly (attachments from typical modern phone cameras are accepted where they previously were not).
- **SC-003**: 100% of existing desktop "Enter to submit" upload flows continue to work with no regression.
- **SC-004**: Implementer-configured file size limits continue to be honored with no change in behavior for deployments that have already set a custom value.

## Assumptions

- "Mobile" for the purposes of this feature means small viewport widths typical of phones, matching where the current issue was observed (notably Android devices); no specific device/browser matrix beyond "verify on at least one Android device or emulator" (per the source issue) is assumed.
- The fix applies to the single shared add-attachment review/caption step used by both the file-picker and camera-capture paths, since both funnel into the same component today.
- Raising the default file size limit is a platform-level default change, not a per-widget or per-deployment change; existing implementer overrides remain fully respected (FR-005).
- No new file-type restrictions are introduced; this feature only changes the size limit and the submit interaction, not what file types are accepted.
