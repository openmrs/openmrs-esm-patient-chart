import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  contactAttributeTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.UUID,
    },
    _description: 'The UUIDs of person attribute types that store contact information',
    _default: [
      // Telephone number
      '14d4f066-15f5-102d-96e4-000c29c2a5d7',
    ],
  },
  printPatientSticker: {
    header: {
      _type: Type.Object,
      _description: 'Configuration properties for patient identifier stickers',
      showBarcode: {
        _type: Type.Boolean,
        _description: 'Whether to display a barcode on the patient sticker',
      },
      showLogo: {
        _type: Type.Boolean,
        _description: 'Whether to display a logo on the patient sticker',
      },
      logo: {
        _type: Type.String,
        _description: 'The URL of the logo to display in the patient sticker',
      },
      _default: {
        showBarcode: true,
        showLogo: true,
        logo: '',
      },
    },
    fields: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _description: 'Patient demographics to include in the patient sticker printout',
      _default: ['name', 'dob', 'gender', 'identifier', 'age', 'contact', 'address'],
    },
    pageSize: {
      _type: Type.String,
      _description:
        'Specifies the paper size for printing the sticker. You can define the size using units (e.g., mm, in) or named sizes (e.g., "148mm 210mm", "A1", "A2", "A4", "A5").',
      _default: 'A4',
    },
    printScale: {
      _type: Type.String,
      _description:
        'Set the scale for the printed content. A value between 0 and 1 shrinks the content, while a value greater than 1 enlarges it. The scale must be greater than 0.',
      _default: '1',
    },
    identifiersToDisplay: {
      _type: Type.Array,
      _elements: {
        _type: Type.UUID,
      },
      _description:
        'List of UUIDs of patient identifier types to include on the patient sticker. If empty, all identifiers will be displayed.',
      _default: [],
    },
  },
  useRelationshipNameLink: {
    _type: Type.Boolean,
    _description: "Whether to use the relationship name as a link to the associated person's patient chart.",
    _default: false,
  },
};

export type AllowedPatientFields = 'address' | 'age' | 'contact' | 'dob' | 'gender' | 'identifier' | 'name';

export interface ConfigObject {
  contactAttributeTypes: Array<string>;
  printPatientSticker: {
    header: {
      showBarcode: boolean;
      showLogo: boolean;
      logo: string;
    };
    fields: Array<AllowedPatientFields>;
    pageSize: string;
    printScale: string;
    identifiersToDisplay: Array<string>;
  };
  useRelationshipNameLink: boolean;
}
