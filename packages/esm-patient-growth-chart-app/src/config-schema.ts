import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  concepts: {
    weightUuid: {
      _type: Type.ConceptUuid,
      _description: 'Concept used to record weight',
      _default: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
};

export interface ConfigObject {
  concepts: {
    weightUuid: string;
  };
}
