/**
 * Storage keys for the client-side state this feature keeps. OpenMRS core has no order-level
 * "notify me" field and no server-side review audit, so V1 keeps both in localStorage. See the
 * "Known limitations" section of the feature doc — a server-side `notifyWhenResulted` order
 * attribute is the intended follow-up.
 */

/** Review state is per-user, so a shared workstation doesn't leak one clinician's triage to the next. */
export function reviewedStorageKey(userUuid: string): string {
  return `openmrs:smart-notifications:reviewed:${userUuid}`;
}

/**
 * Read state is separate from review state, and per-user for the same reason. Opening a
 * notification marks it read — it stops counting against the bell but stays in the inbox until it
 * is actually reviewed.
 */
export function readStorageKey(userUuid: string): string {
  return `openmrs:smart-notifications:read:${userUuid}`;
}

/**
 * Opt-in is keyed by patient + concept; there is no order uuid at the time the checkbox is set.
 *
 * Per-user for the same reason as review and read state. "Notify me when resulted" is a promise to
 * the clinician who ticked it, and a browser-global store would quietly turn that into "notify
 * whoever signs in at this workstation next" — the next clinician would inherit the routine
 * notification and be able to clear it by re-ordering the same test with the toggle off.
 */
export function optInStorageKey(userUuid: string): string {
  return `openmrs:smart-notifications:opt-in:${userUuid}`;
}

export function optInKey(patientUuid: string, conceptUuid: string): string {
  return `${patientUuid}:${conceptUuid}`;
}

export const smartNotificationDetailModalName = 'smart-notification-detail-modal';
