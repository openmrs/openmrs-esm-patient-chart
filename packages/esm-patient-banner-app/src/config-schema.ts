import { Type } from '@openmrs/esm-framework';

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
  excludePatientIdentifierCodeTypes: {
    uuids: {
      _type: Type.Array,
      _description: 'List of UUIDs of patient identifier types to exclude from rendering in the patient banner',
      _default: [],
      _elements: {
        _type: Type.UUID,
      },
    },
  },
  numberOfPatientIdStickers: {
    _type: Type.Number,
    _description: 'The number of patient ID stickers to print',
    _default: '30',
  },
  numberOfPatientIdStickerColumns: {
    _type: Type.Number,
    _description: 'The number of columns of patient ID stickers to print per page',
    _default: '3',
  },
  numberOfPatientIdStickerRowsPerPage: {
    _type: Type.Number,
    _description: 'The number of rows for patient ID stickers to print per page',
    _default: '5',
  },
  printIdentifierStickerFields: {
    _type: Type.Array,
    _description: 'Patient demographics to include in the identifier sticker printout',
    _default: ['age', 'dateOfBirth', 'gender', 'identifier', 'name'],
    _elements: {
      _type: Type.String,
    },
  },
  printIdentifierStickerPaperSize: {
    _type: Type.String,
    _description:
      'Specifies the paper size for printing, using units like "mm" or "in", or standard sizes such as "148mm 210mm", "A1", "A2", "A4", or "A5".',
    _default: 'A4',
  },
  printIdentifierStickerHeight: {
    _type: Type.String,
    _description:
      'Specifies the height of each patient ID sticker in the printout in units such as px or rem e.g. "15px", "5rem"',
    _default: '10rem',
  },
  printIdentifierStickerWidth: {
    _type: Type.String,
    _description: 'The width of each patient ID sticker in the printout in units such as px or rem',
    _default: '13rem',
  },
  useRelationshipNameLink: {
    _type: Type.Boolean,
    _description: "Whether to use the relationship name as a link to the associated person's patient chart.",
    _default: false,
  },
};
export interface ConfigObject {
  contactAttributeTypes: Array<string>;
  excludePatientIdentifierCodeTypes: {
    uuids: Array<string>;
  };
  numberOfPatientIdStickerColumns: number;
  numberOfPatientIdStickerRowsPerPage: number;
  numberOfPatientIdStickers: number;
  printIdentifierStickerFields: Array<string>;
  printIdentifierStickerHeight: string;
  printIdentifierStickerPaperSize: string;
  printIdentifierStickerWidth: string;
  useRelationshipNameLink: boolean;
}
