export const moduleName = '@openmrs/esm-patient-audit-history-app';

export const PRIVILEGE_VIEW_AUDIT_LOG = 'View Audit Log';

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZES = [10, 20, 50];

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
]);
