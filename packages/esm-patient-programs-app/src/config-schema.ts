import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  customUrl: {
    _type: Type.String,
    _default: '',
  },
};

export interface ConfigObject {
  customUrl: string;
}
