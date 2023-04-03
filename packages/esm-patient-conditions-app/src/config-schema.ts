import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  conditionConceptClassUuid: {
    _type: Type.ConceptUuid,
    _description: 'The concept class UUID for conditions',
    _default: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
  },
  conditionPageSize: {
    _type: Type.Number,
    _description: 'The default page size for the conditions',
    _default: 5,
  },
};

export interface ConfigObject {
  conditionConceptClassUuid: string;
  conditionPageSize: number;
}
