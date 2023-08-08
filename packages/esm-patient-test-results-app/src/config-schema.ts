import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  concepts: {
    _type: Type.Array,
    _elements: {
      conceptUuid: {
        _type: Type.UUID,
        _description: 'UUID of concept to load from /obstree',
      },
      defaultOpen: {
        _type: Type.Boolean,
        _description: 'Set default behavior of filter accordion',
      },
    },
    _default: [
      {
        conceptUuid: 'ae485e65-2e3f-4297-b35e-c818bbefe894',
        defaultOpen: true,
      },
      {
        conceptUuid: '8904fa2b-6a8f-437d-89ec-6fce3cd99093',
        defaultOpen: false,
      },
      {
        conceptUuid: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
    ],
  },

  showPrintButton: {
    _type: Type.Boolean,
    _default: true,
    _description:
      'Determines whether or not to display the Print button in the testResults. If set to true, a Print button gets shown next to the tree panel button. When clicked, a datatable wrapped in a Modal pops up with a print button whilch when clicked prints out the contents of the table',
  },
};

export interface ObsTreeEntry {
  conceptUuid: string;
  defaultOpen: boolean;
}
export interface ConfigObject {
  concepts: Array<ObsTreeEntry>;
  showPrintButton: boolean;
}
