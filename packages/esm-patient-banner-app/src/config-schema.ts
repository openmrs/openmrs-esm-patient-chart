import { Type } from '@openmrs/esm-framework';
import _default from 'react-hook-form/dist/logic/appendErrors';

export const configSchema = {
  contactAttributeTypes: {
    _type: Type.Array,
    _description: 'The UUIDs of person attribute types that store contact information',
    _default: [
      // Telephone number
      '14d4f066-15f5-102d-96e4-000c29c2a5d7',
    ],
    _elements: {
      _type: Type.UUID,
    },
  },
  printPatientSticker: {
    enabled: {
      _type: Type.Boolean,
      _description: 'Whether to enable the print patient sticker feature',
      _default: true,
    },
    header: {
      _type: Type.Object,
      _description: 'The header to display on the patient sticker',
      _elements: {
        showBarcode: {
          _type: Type.Boolean,
          _description: 'Whether to display a barcode on the patient sticker',
          _default: true,
        },
        showLogo: {
          _type: Type.Boolean,
          _description: 'Whether to display a logo on the patient sticker',
          _default: true,
        },
        logo: {
          _type: Type.String,
          _description: 'The URL of the logo to display in the patient sticker',
          _default: '',
        },
      },
    },
    fields: {
      _type: Type.Array,
      _description: 'Patient demographics to include in the patient sticker printout',
      _default: ['name', 'dob', 'gender', 'identifier', 'age'],
    },
    pageSize: {
      _type: Type.String,
      _description:
        'Specifies the paper size for printing the sticker. You can define the size using units (e.g., mm, in) or named sizes (e.g., "148mm 210mm", "A1", "A2", "A4", "A5").',
      _default: 'A4',
    },
    identifiersToDisplay: {
      _type: Type.Array,
      _description:
        'List of UUIDs of patient identifier types to exclude from rendering in the patient banner. If empty, all identifiers will be displayed.',
      _default: [],
      _elements: {
        _type: Type.UUID,
      },
    },
  },
  useRelationshipNameLink: {
    _type: Type.Boolean,
    _description: "Whether to use the relationship name as a link to the associated person's patient chart.",
    _default: false,
  },
};

export type AllowedPatientFields = 'name' | 'dob' | 'gender' | 'identifier' | 'age';

export interface ConfigObject {
  contactAttributeTypes: Array<string>;
  printPatientSticker: {
    enabled: boolean;
    header: {
      showBarcode: boolean;
      showLogo: boolean;
      logo: string;
    };
    fields: Array<AllowedPatientFields>;
    pageSize: string;
    identifiersToDisplay: Array<string>;
  };
  useRelationshipNameLink: boolean;
}
