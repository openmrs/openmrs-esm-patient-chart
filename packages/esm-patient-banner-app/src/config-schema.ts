import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  contactAttributeTypes: {
    _type: Type.Array,
    _description: `An array of person attribute type UUIDs related to contact information. These can include UUIDs for attributes like 'Contact phone number', 'Next of Kin phone number', 'Alternative phone number' and so on.`,
    _elements: {
      attributeTypeUuid: { _type: Type.String, _description: `The UUID of a specific person attribute type` },
    },
    _default: [],
  },
};

export interface ConfigObject {
  contactAttributeTypes: Array<{ attributeTypeUuid: string }>;
}
