import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  customUrl: {
    _type: Type.String,
    _default: '',
  },
  hideAddProgramButton: {
    _type: Type.Boolean,
    _default: false,
  },
};

export interface ConfigObject {
  customUrl: string;
  hideAddProgramButton: boolean;
}
