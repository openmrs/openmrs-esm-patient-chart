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
  useCustomAddressLabel: {
    enabled: {
      _type: Type.Boolean,
      _description: 'whether to enable using custom address labels',
      _default: false,
    },
    customAddressLabel: {
      _type: Type.Object,
      _description: 'custom labels for addresses',
      _default: {},
    },
  },
  useRelationshipNameLink: {
    _type: Type.Boolean,
    _description: 'Enable the use of a link to the patient chart in relationship names',
    _default: false,
  },
};

export interface ConfigObject {
  contactAttributeType: Array<string>;
  useCustomAddressLabel: {
    enabled: boolean;
    customAddressLabel: Object;
  };
  useRelationshipNameLink: boolean;
}
