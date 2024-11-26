import { Type } from '@openmrs/esm-framework';
import _default from 'react-hook-form/dist/logic/appendErrors';

export const configSchema = {
  resultsViewerConcepts: {
    _type: Type.Array,
    _elements: {
      conceptUuid: {
        _type: Type.UUID,
        _description: `UUID of a test or a concept set containing tests as members, members' members, and so on. Test results will be loaded by querying the REST /obstree endpoint with this concept.`,
      },
      defaultOpen: {
        _type: Type.Boolean,
        _description:
          'Each concept set displays the test results it contains in an accordion. Should the accordion be open by default?',
      },
    },
    _default: [
      {
        // Hematology
        conceptUuid: 'ae485e65-2e3f-4297-b35e-c818bbefe894',
        defaultOpen: false,
      },
      {
        // Bloodwork (contains Hematology, above)
        conceptUuid: '8904fa2b-6a8f-437d-89ec-6fce3cd99093',
        defaultOpen: false,
      },
      {
        // HIV viral load
        conceptUuid: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
    ],
  },
  orders: {
    labOrderTypeUuid: {
      _type: Type.UUID,
      _description: "UUID for the 'Lab' order type",
      _default: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
    },
    labOrderConceptClasses: {
      _type: Type.UUID,
      _description: 'Concept class of the orderable lab concepts',
      _default: [
        // '8d4907b2-c2cc-11de-8d13-0010c6dffd0f'
      ],
    },
    labOrderableConcepts: {
      _type: Type.Array,
      _description:
        'UUIDs of concepts that represent orderable lab tests or lab sets. If an empty array `[]` is provided, every concept with mentioned concept classes will be considered orderable.',
      _elements: {
        _type: Type.UUID,
      },
      _default: [
        // '1748a953-d12e-4be1-914c-f6b096c6cdef'
      ],
    },
  },
  showLabReferenceNumberField: {
    _type: Type.Boolean,
    _default: true,
    _description:
      'Whether to display the Lab Reference number field in the Lab Order form. This field maps to the accesion_number property in the Order data model',
  },
  additionalTestOrderTypes: {
    _type: Type.Array,
    _description: '',
    _elements: {
      _type: Type.Object,
      orderTypeUuid: {
        _type: Type.UUID,
        _description: 'UUID for the new order type',
      },
      orderableConceptClasses: {
        _type: Type.Array,
        _description:
          'The concept class of the orderable concepts. By default it will look for concept class in the order type properties',
        _elements: {
          _type: Type.UUID,
        },
      },
      orderableConceptSets: {
        _type: Type.UUID,
        _description:
          'UUIDs of concepts that represent orderable concept sets. If an empty array `[]` is provided, every concept with class mentioned in the `orderType` will be considered orderable.',
      },
    },
    _default: [
      // {
      //   orderTypeUuid: '67a92e56-0f88-11ea-8d71-362b9e155667',
      //   orderableConceptSets: [],
      // },
      // {
      //   orderTypeUuid: '5338a5b1-2cbc-4081-9a9b-9e479e2acaad',
      //   orderableConceptSets: [],
      // },
    ],
  },
  labTestsWithOrderReasons: {
    _type: Type.Array,
    _elements: {
      labTestUuid: {
        _type: Type.UUID,
        _description: 'UUID of the lab test that requires a reason for ordering',
        _default: '',
      },
      required: {
        _type: Type.Boolean,
        _description: 'Whether the order reason is required or not',
        _default: false,
      },
      orderReasons: {
        _type: Type.Array,
        _elements: {
          _type: Type.ConceptUuid,
          _description: 'Array of coded concepts that represent reasons for ordering a lab test',
        },
        _default: [],
        _description: 'Coded Lab test order reason options',
      },
    },
    _default: [],
    _description: 'Whether to allow for provision of coded order reason',
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
  orderReasons: Array<string>;
  required: boolean;
}

export interface ConfigObject {
  labTestsWithOrderReasons: Array<OrderReason>;
  orders: {
    labOrderTypeUuid: string;
    labOrderableConcepts: Array<string>;
    labOrderConceptClasses: Array<string>;
  };
  showLabReferenceNumberField: boolean;
  additionalTestOrderTypes: Array<{
    orderTypeUuid: string;
    orderableConceptClasses: Array<string>;
    orderableConceptSets: Array<string>;
  }>;
  resultsViewerConcepts: Array<ObsTreeEntry>;
}
