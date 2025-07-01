import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  orderEncounterType: {
    _type: Type.UUID,
    _description: 'The encounter type of the encounter encapsulating orders',
    _default: '39da3525-afe4-45ff-8977-c53b7b359158',
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
    },
    _description: 'List of various order types, each associated with the Java class name `org.openmrs.Order`.',
    _default: [],
  },
  showReferenceNumberField: {
    _type: Type.Boolean,
    _default: true,
    _description:
      'Whether to display the Reference number field in the Order form. This field maps to the accesion_number property in the Order data model',
  },
};

export interface OrderTypeDefinition {
  label?: string;
  orderTypeUuid: string;
  orderableConceptSets: Array<string>;
  icon?: string;
}

export interface ConfigObject {
  orderEncounterType: string;
  showPrintButton: boolean;
  orderTypes: Array<OrderTypeDefinition>;
  showReferenceNumberField: boolean;
}
