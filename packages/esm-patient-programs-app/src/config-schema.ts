import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  hideAddProgramButton: {
    _type: Type.Boolean,
    _default: false,
  },
  showProgramStatusField: {
    _type: Type.Boolean,
    _description:
      'Whether to show the Program status field in the Record program enrollment and Edit program enrollment forms. If set to true, the `Program status` field is displayed in the Programs datatable',
    _default: false,
  },
};

export interface ConfigObject {
  hideAddProgramButton: boolean;
  showProgramStatusField: boolean;
}
