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
        orderTypeUuid: '425ae793-e776-4f84-8be1-2f322744644d',
        conceptClass: '',
        orderableConcepts: ['06393843-1790-43cd-acba-cd497300c734'],
      },
    ],
    _elements: {
      orderTypeUuid: {
        _type: Type.String,
        _description: 'Order type UUID to be displayed on the order basket',
      },
      conceptClass: {
        _type: Type.String,
        _description: 'Concept with the given class name will be ordered',
      },
      orderableConcepts: {
        _type: Type.Array,
        _description:
          'UUIDs of concepts that represent orderable concepts. Either the `conceptClass` should be given, or the orderableConcepts',
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
    conceptClass: string;
    orderableConcepts: Array<string>;
  }>;
}
