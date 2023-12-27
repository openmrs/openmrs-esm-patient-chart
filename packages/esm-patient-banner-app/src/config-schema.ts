import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  contactAttributeType: {
    _type: Type.UUID,
    _description:
      'The UUID of a person attribute type that captures contact information, such as "Next of kin contact details"',
    _default: [],
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
  contactAttributeType: Array<string>;
  excludePatientIdentifierCodeTypes: Array<String>;
  customAddressLabels: Object;
  useRelationshipNameLink: boolean;
}
