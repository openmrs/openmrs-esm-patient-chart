import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  data: {
    _type: Type.Array,
    _elements: {
      concept: {
        _type: Type.ConceptUuid,
      },
      label: {
        _type: Type.String,
      },
      color: {
        _type: Type.String,
      },
    },
    _default: [
      {
        label: 'Height',
        concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        color: 'red',
      },
      {
        label: 'Weight',
        concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        color: 'blue',
      },
    ],
  },
  table: {
    pageSize: {
      _type: Type.Number,
      _default: 5,
    },
  },
};

export interface ConfigObject {
  data: Array<{
    concept: string;
    label: string;
    color: string;
  }>;
}
