import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  contactAttributeTypes: {
    _type: Type.Array,
    _description: 'The UUIDs of person attribute types that store contact information',
    _default: [],
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
      'Specifies the paper size for printing the sticker. You can define the size using units (e.g., mm, in) or named sizes (e.g., "148mm 210mm", "A1", "A2", "A4", "A5").',
    _default: 'A4',
  },

  printIdentifierStickerHeight: {
    _type: Type.String,
    _description:
      'Specifies the height of each Identifier sticker on the printing page. You should define the units (eg 15px, 5rem ...)',
    _default: '10rem',
  },

  printIdentifierStickerWidth: {
    _type: Type.String,
    _description:
      'Specifies the width of each Identifier sticker on the printing page. You should define the units (eg 15px, 5rem ...)',
    _default: '13rem',
  },
  numberOfPatientIdStickers: {
    _type: Type.Number,
    _description: 'Specifies the number of patient idenifier stickers to print.',
    _default: '30',
  },
  numberOfPatientIdStickerRowsPerPage: {
    _type: Type.Number,
    _description: 'Specifies the number of rows of the patient idenifier stickers to appear on each printed page.',
    _default: '5',
  },
  numberOfPatientIdStickerColumns: {
    _type: Type.Number,
    _description: 'Specifies the number of columns of the patient idenifier stickers to appear on the printed page.',
    _default: '3',
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
  printIdentifierStickerFields: Array<string>;
  printIdentifierStickerPaperSize: string;
  numberOfPatientIdStickers: number;
  numberOfPatientIdStickerRowsPerPage: number;
  numberOfPatientIdStickerColumns: number;
  useRelationshipNameLink: boolean;
  printIdentifierStickerHeight: string;
  printIdentifierStickerWidth: string;
}
