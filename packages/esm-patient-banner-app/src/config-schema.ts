import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  contactAttributeTypes: {
    _type: Type.Array,
    _description:
      'The UUIDs of person attribute types that capture contact information, such as "Next of kin contact details"',
    _default: [],
    _elements: {
      _type: Type.UUID,
    },
  },
  excludePatientIdentifierCodeTypes: {
    uuids: {
      _type: Type.Array,
      _description: 'The UUIDs of patient identifier types that should be excluded from patient banner.',
      _default: [],
      _elements: {
        _type: Type.UUID,
      },
    },
  },
  useRelationshipNameLink: {
    _type: Type.Boolean,
    _description: "Whether to use the relationship name as a link to the person's patient chart",
    _default: false,
  },
};

export interface ConfigObject {
  contactAttributeTypes: Array<string>;
  excludePatientIdentifierCodeTypes: Array<String>;
  customAddressLabels: Object;
  useRelationshipNameLink: boolean;
}
