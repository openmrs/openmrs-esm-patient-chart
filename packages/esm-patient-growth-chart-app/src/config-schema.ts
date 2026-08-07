import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  concepts: {
    weightUuid: {
      _type: Type.ConceptUuid,
      _default: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      _description: 'Concept UUID for Weight observations',
    },
  },
};

export interface ConfigObject {
  concepts: {
    weightUuid: string;
  };
}
