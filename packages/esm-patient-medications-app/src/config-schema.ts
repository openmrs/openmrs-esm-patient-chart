import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  daysDurationUnit: {
    _description:
      'The default medication duration unit is days. The concept for that medication duration unit is specified here.',
    uuid: {
      _type: Type.ConceptUuid,
      _default: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
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
  maxDispenseDurationInDays: {
    _type: Type.Number,
    _default: 99,
    _description: 'The maximum number of days for medication dispensing.',
  },
  debounceDelayInMs: {
    _type: Type.Number,
    _description:
      'Number of milliseconds to delay the search operation in the drug search input by after the user starts typing. The useDebounce hook delays the search by 300ms by default',
    _default: 300,
  },
  isIndicationFieldOptional: {
    _type: Type.Boolean,
    _description: 'Whether to require an indication when placing a medication order',
    _default: false,
  },
};

export interface ConfigObject {
  daysDurationUnit: {
    uuid: string;
    display: string;
  };
  drugOrderTypeUUID: string;
  showPrintButton: boolean;
  maxDispenseDurationInDays: number;
  debounceDelayInMs: number;
  isIndicationFieldOptional: boolean;
}
