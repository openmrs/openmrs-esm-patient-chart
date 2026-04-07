import { Type, validators } from '@openmrs/esm-framework';

export const configSchemaSwitchable = {
  title: {
    _type: Type.String,
    _description: 'Displayed at the top of the widget. Can also be a translation key.',
    _default: 'Vitals',
  },
  resultsName: {
    _type: Type.String,
    _description: 'Displayed in messages about this data.',
    _default: 'results',
  },
  graphOldestFirst: {
    _type: Type.Boolean,
    _description: 'Plot values from oldest (left) to newest (right)',
    _default: false,
  },
  tableSortOldestFirst: {
    _type: Type.Boolean,
    _description: 'Sort table by default from oldest to newest',
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
      _type: Type.Object,
      concept: {
        _type: Type.ConceptUuid,
      },
      label: {
        _type: Type.String,
        _default: '',
        _description: 'Label to display for the concept. If not provided, the concept display name will be used.',
      },
      color: {
        _type: Type.String,
        _default: 'blue',
        _description: 'The color of the line to display in the line graph.',
      },
      graphGroup: {
        _type: Type.String,
        _default: '',
        _description:
          'For showing multiple lines on the same graph. If multiple obs should be shown together, give them the same `graphGroup`. The value of `graphGroup` will be used as the label (or translation key) in the graph view menu panel.',
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
    _description: 'Only show obs from these encounter types',
    _default: [],
  },
  dateFormat: {
    _type: Type.String,
    _description: 'Format the date as a "date", "time", or "dateTime"',
    _default: 'dateTime',
    _validators: [validators.oneOf(['date', 'time', 'dateTime'])],
  },
  showEncounterType: {
    _type: Type.Boolean,
    _description: 'Display Encounter type column',
    _default: false,
  },
};

export interface ConfigObjectSwitchable {
  title: string;
  resultsName: string;
  graphOldestFirst: boolean;
  tableSortOldestFirst: boolean;
  interpretationSlot: string;
  data: Array<{
    concept: string;
    label: string;
    color: string;
    graphGroup: string;
    decimalPlaces: number;
  }>;
  table: {
    pageSize: number;
  };
  showGraphByDefault: boolean;
  encounterTypes: Array<string>;
  dateFormat: 'date' | 'time' | 'dateTime';
  showEncounterType: boolean;
}
