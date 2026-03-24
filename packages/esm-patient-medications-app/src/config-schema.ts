import { Type, validator } from '@openmrs/esm-framework';

export const configSchema = {
  daysDurationUnit: {
    uuid: {
      _type: Type.ConceptUuid,
      _default: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      _description: 'The uuid of the concept of medication duration unit in days',
    },
    display: {
      _type: Type.String,
      _description: 'The text to display in the medication duration units menu for the "days" unit.',
      _default: 'Days',
    },
  },
  drugOrderTypeUUID: {
    _type: Type.UUID,
    _description: "UUID for the 'Drug' order type to fetch medications",
    _default: '131168f4-15f5-102d-96e4-000c29c2a5d7',
  },
  showPrintButton: {
    _type: Type.Boolean,
    _default: false,
    _description:
      'Determines whether or not to display the Print button in both the active and past medications datatable headers. If set to true, a Print button gets shown in both the active and past medications table headers. When clicked, this button enables the user to print out the contents of the table',
  },
  debounceDelayInMs: {
    _type: Type.Number,
    _description:
      'Number of milliseconds to delay the search operation in the drug search input by after the user starts typing. The useDebounce hook delays the search by 300ms by default',
    _default: 300,
    _validators: [validator((v: unknown) => typeof v === 'number' && v > 0, 'Must be greater than zero')],
  },
  requireIndication: {
    _type: Type.Boolean,
    _description: 'Whether to require an indication when placing a medication order',
    _default: true,
  },
  durationUnitsDaysMap: {
    _type: Type.Object,
    _description:
      'Maps duration unit CIEL concept UUIDs to their equivalent number of days for auto-calculating dispense quantity. Months uses 30 as an approximation.',
    _default: {
      '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 1, // Days
      '1073AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 7, // Weeks
      '1074AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 30, // Months
      '1734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 365, // Years
    },
  },
};

export interface ConfigObject {
  daysDurationUnit: {
    uuid: string;
    display: string;
  };
  drugOrderTypeUUID: string;
  showPrintButton: boolean;
  debounceDelayInMs: number;
  requireIndication: boolean;
  durationUnitsDaysMap: Record<string, number>;
}
