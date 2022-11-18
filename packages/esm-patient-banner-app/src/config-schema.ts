import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  contactAttributeType: {
    _type: Type.UUID,
    _description:
      'The Uuids of person attribute-type that captures contact information `e.g Next of kin contact details`',
    _default: [],
  },
  defaultPatientIdentifier: {
    _type: Type.Array,
    _description: 'Patient Identifier to be displayed in patient banner',
    _default: ['National Unique patient identifier', 'Patient Clinic Number', 'Unique Patient Number'],
  },
};

export interface ConfigObject {
  contactAttributeType: Array<string>;
  defaultPatientIdentifier: Array<string>;
}
