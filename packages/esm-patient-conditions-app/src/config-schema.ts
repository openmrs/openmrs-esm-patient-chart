import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  conditionConceptClassUuid: {
    _type: Type.ConceptUuid,
    _description: 'The concept class UUID for conditions',
    _default: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
  },
  conditionConceptSets: {
    _type: Type.Array,
    _elements: {
      _type: Type.ConceptUuid,
    },
    _description:
      'UUIDs of concept sets whose members are the conditions offered in the conditions form. When set, the condition search only offers members of these sets (of any concept class) instead of all concepts with the class conditionConceptClassUuid. Leave empty to search by concept class.',
    _default: [],
  },
  conditionPageSize: {
    _type: Type.Number,
    _description: 'The default page size for the conditions',
    _default: 5,
  },
};

export interface ConfigObject {
  conditionConceptClassUuid: string;
  conditionConceptSets: Array<string>;
  conditionPageSize: number;
}
