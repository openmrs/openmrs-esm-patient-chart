import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  title: {
    _type: Type.String,
    _default: 'Vitals',
  },
  noDataMessage: {
    _type: Type.String,
    _default: "There's no data to display here",
  },
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
  title: string;
  noDataMessage: string;
  data: Array<{
    concept: string;
    label: string;
    color: string;
  }>;
  table: {
    pageSize: number;
  };
}
