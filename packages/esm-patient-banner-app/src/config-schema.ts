import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  contactAttributeType: {
    _type: Type.Array,
    _description:
      'The Uuids of person attribute-type that captures contact information `e.g Next of kin contact details`',
    _elements: {
      attributeTypeUuid: {
        _type: Type.UUID,
        _description: 'Attribute type Uuid',
      },
    },
    _default: [],
  },
};

export interface ConfigObject {
  contactAttributeType: Array<{ attributeTypeUuid: string }>;
}
