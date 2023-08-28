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
      'Whether or not to display the print button in the Test Results dashboard. When set to `true`, a print button is shown alongside the panel and tree view content switcher. When clicked, a modal pops up showing a datatable with the available test results. Once the user selects an appropriate date range, they can click on the print button in the modal to print the data',
  },
  orders: {
    // TODO: What is this and should it default to null (show all orders)?
    careSettingUuid: {
      _type: Type.UUID,
      _description: 'Only orders corresponding to this care setting will be displayed.',
      _default: '6f0c9a92-6f24-11e3-af88-005056821db0',
    },
    labOrderTypeUuid: {
      _type: Type.UUID,
      _description: "UUID for the 'Lab' order type",
      _default: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
    },
  },
};

export interface ObsTreeEntry {
  conceptUuid: string;
  defaultOpen: boolean;
}
export interface ConfigObject {
  concepts: Array<ObsTreeEntry>;
  showPrintButton: boolean;
  orders: {
    careSettingUuid: string;
    labOrderTypeUuid: string;
  };
}
