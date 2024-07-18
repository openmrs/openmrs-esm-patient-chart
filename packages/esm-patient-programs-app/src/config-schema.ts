import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  hideAddProgramButton: {
    _type: Type.Boolean,
    _default: false,
  },
};

export interface ConfigObject {
  hideAddProgramButton: boolean;
}
