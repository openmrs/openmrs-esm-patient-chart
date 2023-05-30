import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  contactAttributeType: {
    _type: Type.UUID,
    _description:
      'The Uuids of person attribute-type that captures contact information `e.g Next of kin contact details`',
    _default: [],
  },
  excludePatientIdentifierCodeTypes: {
    uuids: {
      _type: Type.Array,
      _description: 'The Uuids of patient identifier types that should be excluded from patient banner.',
      _default: [],
    },
  },
  customAddressLabel: {
    _type: Type.Object,
    _description: 'Whether to use custom labels for addresses',
    _default: {},
  },
};

export interface ConfigObject {
  contactAttributeType: Array<string>;
  customAddressLabel: Object;
}
