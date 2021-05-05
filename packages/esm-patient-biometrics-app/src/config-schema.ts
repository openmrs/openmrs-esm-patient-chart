import { Type } from '@openmrs/esm-framework';
import biometricsConfigSchema, { BiometricsConfigObject } from './biometrics/biometrics-config-schema';

export const configSchema = {
  concepts: {
    heightUuid: {
      _type: Type.ConceptUuid,
      _default: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    weightUuid: {
      _type: Type.ConceptUuid,
      _default: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  biometrics: biometricsConfigSchema,
};

export interface ConfigObject {
  concepts: {
    heightUuid: string;
    weightUuid: string;
  };
  biometrics: BiometricsConfigObject;
}
