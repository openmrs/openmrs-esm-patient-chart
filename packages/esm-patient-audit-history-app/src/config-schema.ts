import { Type } from '@openmrs/esm-framework';
import { DEFAULT_PAGE_SIZE, PRIVILEGE_VIEW_AUDIT_LOG } from './constants';

export const configSchema = {
  viewPrivilege: {
    _type: Type.String,
    _description:
      "Privilege required to view a patient's audit history. Leave blank to disable the check on deployments that don't register the privilege.",
    _default: PRIVILEGE_VIEW_AUDIT_LOG,
  },
  auditHistoryPageSize: {
    _type: Type.Number,
    _description: 'The number of audit history revisions to show per page.',
    _default: DEFAULT_PAGE_SIZE,
  },
};

export interface ConfigObject {
  viewPrivilege: string;
  auditHistoryPageSize: number;
}
