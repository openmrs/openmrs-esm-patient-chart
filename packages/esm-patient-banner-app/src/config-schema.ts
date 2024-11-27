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
    printStickerFields: {
      _type: Type.Object,
      _description: 'Configuration of the patient sticker fields for the patient identifier stickers',
      fields: {
        _type: Type.Array,
        _description: 'Patient demographics to include in the patient sticker printout',
      },
      fieldSeparator: {
        _type: Type.Boolean,
        _description: 'Whether to display a colon symbol alongside each field label',
      },
      fieldsTableGroups: {
        _type: Type.Array,
        _description:
          'Groups of patient demographic fields to be displayed as distinct tables in the patient sticker. Each group contains a set of related fields that will appear together in one table ie a single line.',
      },
      fieldsContainerStyleOverrides: {
        _type: Type.Object,
        _description: 'CSS style elements override how fields appear in the field container.',
      },
      _default: {
        fields: ['name', 'dob', 'gender', 'identifier', 'age', 'contact', 'address'],
        fieldSeparator: false,
        fieldsTableGroups: [],
        fieldsContainerStyleOverrides: {},
      },
    },
    pageSize: {
      _type: Type.String,
      _description:
        'Specifies the paper size for printing the sticker. You can define the size using units (e.g., mm, in) or named sizes (e.g., "148mm 210mm", "A1", "A2", "A4", "A5").',
      _default: 'A4',
    },
    printMultipleStickers: {
      _type: Type.Object,
      _description: 'Configuration of how many stickers to print, together with the columns and rows to print per page',
      numberOfStickers: {
        _type: Type.Number,
        _description: 'The number of patient ID stickers to print',
      },
      stickerColumnsPerPage: {
        _type: Type.Number,
        _description: 'The number of columns of patient ID stickers to print per page',
      },
      stickerRowsPerPage: {
        _type: Type.Number,
        _description: 'The number of rows of patient ID stickers to print per page',
      },
      _default: {
        enabled: false,
        numberOfStickers: 1,
        stickerColumnsPerPage: 1,
        stickerRowsPerPage: 1,
      },
    },
    stickerSize: {
      _type: Type.Object,
      _description: 'Configuration of the patient sticker height and width for the patient identifier stickers',
      height: {
        _type: Type.String,
        _description:
          'Specifies the height of each patient ID sticker in the printout in units such as inches or centimetres.',
      },
      width: {
        _type: Type.String,
        _description: 'The width of each patient ID sticker in the printout in units such as inches or centimetres.',
      },
      _default: {
        height: 'auto',
        width: 'auto',
      },
    },
    identifiersToDisplay: {
      _type: Type.Array,
      _description:
        'List of UUIDs of patient identifier types to include on the patient sticker. If empty, all identifiers will be displayed.',
      _default: [],
      _elements: {
        _type: Type.UUID,
      },
    },
    autoPrint: {
      _type: Type.Boolean,
      _description: 'Whether to print the patient sticker by default',
      _default: false,
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
    printStickerFields: {
      fields: Array<AllowedPatientFields>;
      fieldSeparator: boolean;
      fieldsTableGroups: Array<Array<AllowedPatientFields>>;
      fieldsContainerStyleOverrides: Record<string, string | number>;
    };
    pageSize: string;
    printMultipleStickers: {
      numberOfStickers: number;
      stickerColumnsPerPage: number;
      stickerRowsPerPage: number;
    };
    stickerSize: {
      height: string;
      width: string;
    };
    identifiersToDisplay: Array<string>;
    autoPrint: boolean;
  };
  useRelationshipNameLink: boolean;
}
