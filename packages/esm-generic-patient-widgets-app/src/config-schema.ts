import { Type, validators } from '@openmrs/esm-framework';

export const configSchema = {
  title: {
    _type: Type.String,
    _description: 'Displayed at the top of the widget',
    _default: 'Vitals',
  },
  resultsName: {
    _type: Type.String,
    _description: 'Displayed in messages about this data',
    _default: 'results',
  },
  graphOldestFirst: {
    _type: Type.Boolean,
    _description: 'Show graph values from most oldest to recent',
    _default: false,
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
      decimalPlaces: {
        _type: Type.Number,
        _validator: [validators.inRange(0, 10)],
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
  resultsName: string;
  graphOldestFirst: boolean;
  data: Array<{
    concept: string;
    label: string;
    color: string;
  }>;
  table: {
    pageSize: number;
  };
}
