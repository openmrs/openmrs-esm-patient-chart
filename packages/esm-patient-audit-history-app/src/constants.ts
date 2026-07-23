import type { AuditFieldDiff, PatientAuditLog } from './types';

export const moduleName = '@openmrs/esm-patient-audit-history-app';

export const PRIVILEGE_VIEW_AUDIT_LOG = 'View Audit Logs';

export const DEFAULT_PAGE_SIZE = 10;

export const BACKEND_DATETIME_FORMAT = 'DD/MM/YYYY HH:mm:ss';

export const TECHNICAL_FIELDS = new Set<string>([
  'dateCreated',
  'dateChanged',
  'dateVoided',
  'dateRetired',
  'creator',
  'changedBy',
  'voidedBy',
  'retiredBy',
  'personDateCreated',
  'personDateChanged',
  'personDateVoided',
  'personCreator',
  'personChangedBy',
  'personVoidedBy',
  'uuid',
  'id',
  'patientId',
  'personId',
  'patientIdentifierId',
  'personAttributeId',
]);

export function getVisibleChanges(changes: AuditFieldDiff[] = []): AuditFieldDiff[] {
  return changes.filter((change) => change.changed !== false && !TECHNICAL_FIELDS.has(change.fieldName));
}

export function isFullSnapshot(visibleChanges: AuditFieldDiff[]): boolean {
  return visibleChanges.length > 0 && visibleChanges.every((change) => change.oldValue === '');
}

export function countRevisionChanges(log: PatientAuditLog): number {
  return getVisibleChanges(log.changes ?? []).length + (log.relatedEntities?.length ?? 0);
}
