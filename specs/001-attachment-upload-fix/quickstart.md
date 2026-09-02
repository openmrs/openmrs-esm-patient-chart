# Quickstart: Validate the Attachment Upload Fix

Prerequisites: repo dependencies installed (`yarn`), a local OpenMRS backend (or
`E2E_BASE_URL` pointed at dev3) available for the patient chart to talk to.

## 1. Run the widget locally

```bash
yarn start --sources 'packages/esm-patient-attachments-app'
```

Open a patient's chart and navigate to the Attachments widget.

## 2. Validate file size behavior (User Story 2 / FR-004, FR-006, SC-002)

1. Attempt to add a photo file between 1MB and 10MB — expect it to be **accepted** (previously
   rejected under the old 1MB default).
2. Attempt to add a file larger than 10MB — expect the existing error message, now stating the
   10MB limit.
3. In `config.json` for the widget, set `maxFileSize` explicitly (e.g. `2`) and repeat step 1
   with a file between 2MB and 10MB — expect it to be **rejected**, confirming the implementer
   override still takes precedence over the new default (FR-005).

See [contracts/attachments-config.md](./contracts/attachments-config.md) for the exact config
contract.

## 3. Validate mobile submit reachability (User Story 1 / FR-001–FR-003, SC-001)

1. In a browser, open devtools responsive/device mode at a small mobile width (e.g. 375px,
   matching a typical Android phone) — or use a real Android device/emulator per the source
   issue.
2. Open "Add attachment," select or capture a photo, and tap into the caption field so the
   on-screen keyboard opens (devtools device mode can simulate this by shrinking the viewport
   height; a real device is the authoritative check).
3. Confirm the "Add attachment" submit button remains visible and tappable without dismissing
   the keyboard or scrolling.
4. Tap it and confirm the attachment uploads successfully.
5. On a desktop-width viewport, confirm pressing "Enter" in the caption field still submits the
   form (no regression — FR-003).

## 4. Automated checks

```bash
# Component/unit tests for the attachments package
yarn turbo run test --filter=@openmrs/esm-patient-attachments-app

# Full quality gate (lint + typecheck + test), matching CI
yarn verify

# E2E (requires the dev server running per step 1, or E2E_BASE_URL set)
yarn test-e2e --headed
```

Expected outcome: all of the above pass, with the new/updated attachments tests covering the
size-limit boundary (FR-006) and the mobile submit-reachability scenario (FR-001–FR-003).
