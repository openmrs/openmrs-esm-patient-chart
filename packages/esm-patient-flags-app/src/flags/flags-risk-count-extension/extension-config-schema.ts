import { Type } from '@openmrs/esm-framework';

export const riskCountExtensionConfigSchema = {
  hideOnPages: {
    _type: Type.Array,
    _default: ['Patient Summary'],
    _elements: {
      _type: Type.String,
    },
  },
};

export interface FlagsRiskCountExtensionConfig {
  hideOnPages: Array<string>;
}
