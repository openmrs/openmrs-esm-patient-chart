import { Type, validators } from '@openmrs/esm-framework';

export const accentColors = ['purple', 'cyan', 'teal', 'magenta', 'orange', 'red', 'green', 'gray'] as const;
export type AccentColor = (typeof accentColors)[number];

export const configSchema = {
  orderEncounterType: {
    _type: Type.UUID,
    _description: 'The encounter type of the encounter encapsulating orders. Defaults to the "Order" encounter type.',
    _default: '39da3525-afe4-45ff-8977-c53b7b359158',
  },
  careSettingUuid: {
    _type: Type.UUID,
    _description: 'The UUID of the care setting for orders. Defaults to the "Outpatient" care setting.',
    _default: '6f0c9a92-6f24-11e3-af88-005056821db0',
  },
  showPrintButton: {
    _type: Type.Boolean,
    _description:
      'Determines whether or not to display a Print button in the Orders details table. If set to true, a Print button gets shown in both the orders table headers. When clicked, this button enables the user to print out the contents of the table',
    _default: false,
  },
  orderTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.Object,
      orderTypeUuid: {
        _type: Type.UUID,
        _description: 'The UUID of the order type listed in the order basket',
      },
      orderableConceptSets: {
        _type: Type.Array,
        _elements: {
          _type: Type.UUID,
        },
        _description:
          "UUIDs of concepts that represent orderable concepts. Either the `conceptClass` should be given, or the `orderableConcepts`. If the orderableConcepts are not given, then it'll search concepts by concept class.",
      },
      label: {
        _type: Type.String,
        _description:
          'The custom label to be shown for the order type. The label will be translated with the key as the label itself.',
      },
      icon: {
        _type: Type.String,
        _description: 'Icon to be shown for the order type. Icons are from the OpenMRS icon library.',
        _default: '',
      },
      accentColor: {
        _type: Type.String,
        _description: `Accent color applied to the order type's tile: icon backdrop, left border, and top border. Must be one of: ${accentColors.join(', ')}.`,
        _default: 'purple',
        _validators: [validators.oneOf(accentColors)],
      },
    },
    _description: 'List of various order types, each associated with the Java class name `org.openmrs.Order`.',
    _default: [],
  },
  showReferenceNumberField: {
    _type: Type.Boolean,
    _default: true,
    _description:
      'Whether to display the "Reference number" field in the Order form. This field maps to the accession_number property in the Order data model',
  },
  enableAddTestsDuringResultEntry: {
    _type: Type.Boolean,
    _default: false,
    _description:
      'Controls whether users can add extra tests while entering lab results in the test-results workspace.',
  },
  ordererProviderRoles: {
    _type: Type.Array,
    _description:
      'Array of provider roles uuids. If specified, the order basket shows the "Prescribing Clinician" dropdown listing all providers with one of the specified roles. (The dropdown is hidden if no providers match the role criteria.) This feature requires the providermanagement backend module. Note that, in any case, any user who can submit orders form may still do so with themselves as the prescriber.',
    _default: [],
  },
  orderLocationTagName: {
    _type: Type.UUID,
    _description:
      'The name of the ordering location tag. If specified, the order baskets shows the order locations dropdown listing locations with the specified tag. The dropdown is hidden if this config value is not specified, and the order location defaults to the login location of the user.',
    _default: '',
  },
  // labConceptSetUuid: {
  //   _type: Type.UUID,
  //   _description: 'Concept set UUID for Lab orders.',
  //   _default: '1748a953-d12e-4be1-914c-f6b096c6cdef',
  // },
  // radiologyConceptSetUuid: {
  //   _type: Type.UUID,
  //   _description: 'Concept set UUID for Radiology orders.',
  //   _default: 'cd9f116c-517d-439e-847d-d8d257434083',
  // },
  // procedureConceptSetUuid: {
  //   _type: Type.UUID,
  //   _description: 'Concept set UUID for Procedure orders.',
  //   _default: '0c3019b0-9bd3-4bc7-8e2c-e6230c31ed18',
  // },
  // medicalSupplyConceptSetUuid: {
  //   _type: Type.UUID,
  //   _description: 'Concept set UUID for Medical Supply orders.',
  //   _default: '095befe9-ff7c-4eba-bbd8-37b055f52e7d',
  // },
  labConceptSetUuid: {
    _type: Type.UUID,
    _description: 'Concept set UUID for Lab orders.',
    // _default: '300e7e12-f268-4349-81dc-d40cc7a202a0',
    _default: '1748a953-d12e-4be1-914c-f6b096c6cdef',
  },
  radiologyConceptSetUuid: {
    _type: Type.UUID,
    _description: 'Concept set UUID for Radiology orders.',
    // _default: 'd894a942-5d10-431f-b008-28436a977b4e',
    _default: 'cd9f116c-517d-439e-847d-d8d257434083',
  },
  procedureConceptSetUuid: {
    _type: Type.UUID,
    _description: 'Concept set UUID for Procedure orders.',
    _default: '0c3019b0-9bd3-4bc7-8e2c-e6230c31ed18',
    // _default: '0c3019b0-9bd3-4bc7-8e2c-e6230c31ed18',
  },
  medicalSupplyConceptSetUuid: {
    _type: Type.UUID,
    _description: 'Concept set UUID for Medical Supply orders.',
    _default: '095befe9-ff7c-4eba-bbd8-37b055f52e7d',
  },
  labOrderTypeUuid: {
    _type: Type.UUID,
    _description: 'The UUID of the Lab order type.',
    _default: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
  },
  radiologyOrderTypeUuid: {
    _type: Type.UUID,
    _description: 'The UUID of the Radiology order type.',
    _default: 'c19c8e82-8b8d-4b4e-b1ff-3f09890b2db3',
  },
  procedureOrderTypeUuid: {
    _type: Type.UUID,
    _description: 'The UUID of the Procedure order type.',
    _default: '4237a01f-29c5-4167-9d8e-96d6e590aa33',
  },
  medicalSupplyOrderTypeUuid: {
    _type: Type.UUID,
    _description: 'The UUID of the Medical Supply order type.',
    _default: 'dab3ab30-2feb-48ec-b4af-8332a0831b49',
  },
  enableDrugOrderFavorites: {
    _type: Type.Boolean,
    _description: 'Whether to enable pinning drugs as order favorites.',
    _default: true,
  },
  maxPinnedDrugOrders: {
    _type: Type.Number,
    _description: 'Maximum number of pinned drug order favorites.',
    _default: 10,
  },
};

export interface OrderTypeDefinition {
  label?: string;
  orderTypeUuid: string;
  orderableConceptSets: Array<string>;
  icon?: string;
  accentColor?: AccentColor;
}

export interface ConfigObject {
  orderEncounterType: string;
  careSettingUuid: string;
  showPrintButton: boolean;
  orderTypes: Array<OrderTypeDefinition>;
  showReferenceNumberField: boolean;
  enableAddTestsDuringResultEntry: boolean;
  ordererProviderRoles: Array<string>;
  orderLocationTagName: string;
  labConceptSetUuid: string;
  radiologyConceptSetUuid: string;
  procedureConceptSetUuid: string;
  medicalSupplyConceptSetUuid: string;
  labOrderTypeUuid: string;
  radiologyOrderTypeUuid: string;
  procedureOrderTypeUuid: string;
  medicalSupplyOrderTypeUuid: string;
  enableDrugOrderFavorites: boolean;
  maxPinnedDrugOrders: number;
}
