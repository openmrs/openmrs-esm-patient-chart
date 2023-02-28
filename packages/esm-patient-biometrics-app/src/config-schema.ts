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
    muacUuid: {
      _type: Type.ConceptUuid,
      _default: '1343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  vitals: {
    useFormEngine: {
      _type: Type.Boolean,
      _default: false,
      _description:
        'Whether to use an Ampath form as the vitals and biometrics form. If set to true, encounterUuid and formUuid must be set as well.',
    },
    encounterTypeUuid: {
      _type: Type.UUID,
      _default: '67a71486-1a54-468f-ac3e-7091a9a79584',
    },
    formUuid: {
      _type: Type.UUID,
      _default: '9f26aad4-244a-46ca-be49-1196df1a8c9a',
    },
    formName: {
      _type: Type.String,
      _default: 'Vitals',
    },
  },
  biometrics: biometricsConfigSchema,
};

export interface ConfigObject {
  concepts: {
    heightUuid: string;
    weightUuid: string;
    muacUuid: string;
  };
  biometrics: BiometricsConfigObject;
  vitals: {
    useFormEngine: boolean;
    encounterTypeUuid: string;
    formUuid: string;
    formName: string;
  };
}
