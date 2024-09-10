import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  hideAddProgramButton: {
    _type: Type.Boolean,
    _default: false,
  },
  showProgramStatusField: {
    _type: Type.Boolean,
    _description: 'Whether to show the Program status field',
    _default: false,
  },
};

export interface ConfigObject {
  hideAddProgramButton: boolean;
  showProgramStatusField: boolean;
}
