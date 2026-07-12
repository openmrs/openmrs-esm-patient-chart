export type AuditEventType = 'ADD' | 'MOD' | 'DEL';

export interface AuditFieldDiff {
  fieldName: string;
  oldValue: string;
  currentValue: string;
  changed: boolean;
  oldDisplay?: string | null;
  currentDisplay?: string | null;
}

export interface RelatedEntity {
  className: string;
  simpleName: string;
  entityIdValue: string;
  revisionId: number;
  revisionType: AuditEventType | string;
}

export interface PatientAuditLog {
  revisionID: number;
  entityType: string;
  eventType: AuditEventType | string;
  changedBy: string;
  changedOn: string;
  changes?: AuditFieldDiff[];
  relatedEntities?: RelatedEntity[];
}

export interface PatientAuditLogResponse {
  totalLogs: number;
  currentPage: number;
  totalPages: number;
  logs: PatientAuditLog[];
}
