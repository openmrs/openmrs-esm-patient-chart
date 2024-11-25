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
    _default: [
      {
        orderTypeUuid: '67a92e56-0f88-11ea-8d71-362b9e155667',
        conceptClasses: [],
        orderableConcepts: [],
      },
      {
        orderTypeUuid: '67a9328e-0f88-11ea-8d71-362b9e155667',
        conceptClasses: [],
        orderableConcepts: [],
      },
    ],
    _elements: {
      orderTypeUuid: {
        _type: Type.String,
        _description: 'The UUID of the order type listed in the order basket',
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
        _type: Type.Array,
        _description:
          "UUIDs of concepts that represent orderable concepts. Either the `conceptClass` should be given, or the `orderableConcepts`. If the orderableConcepts are not given, then it'll search concepts by concept class.",
        _elements: {
          _type: Type.UUID,
        },
      },
    },
  },
};

export interface ConfigObject {
  orderEncounterType: string;
  showPrintButton: boolean;
  orderTypes: Array<{
    orderTypeUuid: string;
    orderableConceptSets: Array<string>;
    orderableConceptClasses: Array<string>;
  }>;
}
