import { Type, validator, validators } from '@openmrs/esm-framework';

export const configSchema = {
  title: {
    _type: Type.String,
    _description: 'Displayed at the top of the widget.',
    _default: 'Vitals',
  },
  resultsName: {
    _type: Type.String,
    _description: 'Displayed in messages about this data.',
    _default: 'results',
  },
  graphOldestFirst: {
    _type: Type.Boolean,
    _description: 'Show graph values from most oldest to recent',
    _default: false,
  },
  interpretationSlot: {
    _type: Type.String,
    _description: 'Interpretation slot to display bellow the graph in obs graph widget.',
    _default: '',
  },
  data: {
    _type: Type.Array,
    _elements: {
      concept: {
        _type: Type.ConceptUuid,
      },
      label: {
        _type: Type.String,
        _default: '',
        _description: 'The text to display. Defaults to the concept display name.',
      },
      color: {
        _type: Type.String,
        _default: 'blue',
        _description: 'The color of the line to display in the line graph.',
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
  showGraphByDefault: {
    _type: Type.Boolean,
    _description: 'Displayed graph by default',
    _default: false,
  },
  encounterTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
    _description: 'Encounter types used to filter the requests',
    _default: [],
  },
  dateFormat: {
    _type: Type.String,
    _description: 'Type of display for data',
    _default: 'dateTime',
    _validators: [validators.oneOf(['date', 'time', 'dateTime'])],
  },
  showEncounterType: {
    _type: Type.Boolean,
    _description: 'Display Encounter type column',
    _default: false,
  },
};

export interface ConfigObject {
  title: string;
  resultsName: string;
  graphOldestFirst: boolean;
  interpretationSlot: string;
  data: Array<{
    concept: string;
    label: string;
    color: string;
  }>;
  table: {
    pageSize: number;
  };
  showGraphByDefault: boolean;
  encounterTypes: Array<string>;
  dateFormat: 'date' | 'time' | 'dateTime';
}
