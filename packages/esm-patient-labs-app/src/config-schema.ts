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
        defaultOpen: false,
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
    labOrderTypeUuid: {
      _type: Type.UUID,
      _description: "UUID for the 'Lab' order type",
      _default: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
    },
  },
  labTests: {
    _type: Type.Array,
    _elements: {
      labTestUuid: {
        _type: Type.UUID,
        _description: "UUID for the 'Lab' Test that require order reason",
        _default: '',
      },
      labTestOrderReasons: {
        _type: Type.Array,
        _elements: {
          uuid: {
            _type: Type.UUID,
            _description: 'Lab test concept UUID',
          },
          label: {
            _type: Type.String,
            _default: null,
            _description: 'The label for order reason',
          },
        },
        _default: [],
        _description: 'Coded Lab test order reason options',
      },
    },
    _default: [],
    _description: 'Whether to allow for provision of order reason',
  },
};

export interface ObsTreeEntry {
  conceptUuid: string;
  defaultOpen: boolean;
}
export interface LabTestReason {
  uuid: string;
  label?: string;
}
export interface OrderReason {
  labTestUuid: string;
  labTestOrderReasons: Array<LabTestReason>;
}
export interface ConfigObject {
  concepts: Array<ObsTreeEntry>;
  showPrintButton: boolean;
  orders: {
    labOrderTypeUuid: string;
  };
  labTests: Array<OrderReason>;
}
