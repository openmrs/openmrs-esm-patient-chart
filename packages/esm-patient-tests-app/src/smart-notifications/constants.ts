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

/** Opt-in is keyed by patient + concept; there is no order uuid at the time the checkbox is set. */
export const optInStorageKey = 'openmrs:smart-notifications:opt-in';

export function optInKey(patientUuid: string, conceptUuid: string): string {
  return `${patientUuid}:${conceptUuid}`;
}

export const smartNotificationDetailModalName = 'smart-notification-detail-modal';
