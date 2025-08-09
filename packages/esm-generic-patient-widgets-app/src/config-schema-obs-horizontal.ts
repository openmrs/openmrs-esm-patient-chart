import { Type, validator, validators } from '@openmrs/esm-framework';

export const configSchemaHorizontal = {
  title: {
    _type: Type.String,
    _description: 'Displayed at the top of the widget.',
    _default: 'Vitals',
  },
  oldestFirst: {
    _type: Type.Boolean,
    _description: 'Sort columns from oldest to newest',
    _default: false,
  },
  data: {
    _type: Type.Array,
    _elements: {
      _type: Type.Object,
      concept: {
        _type: Type.ConceptUuid,
      },
      label: {
        _type: Type.String,
        _default: '',
        _description: 'The text to display. If empty, defaults to the concept display name.',
      },
      decimalPlaces: {
        _type: Type.Number,
        _default: 2,
        _validator: [validators.inRange(0, 10)],
      },
    },
    _default: [
      {
        concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
      {
        label: 'How heavy?',
        concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
    ],
  },
  maxColumns: {
    _type: Type.Number,
    _default: 5,
  },
  encounterTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
    _description: 'Only show obs from these encounter types',
    _default: [],
  },
  showEncounterType: {
    _type: Type.Boolean,
    _description: 'Display Encounter type row',
    _default: false,
  },
};

export interface ConfigObjectHorizontal {
  title: string;
  resultsName: string;
  oldestFirst: boolean;
  data: Array<{
    concept: string;
    label: string;
    decimalPlaces: number;
  }>;
  maxColumns: number;
  encounterTypes: Array<string>;
  showEncounterType: boolean;
}
