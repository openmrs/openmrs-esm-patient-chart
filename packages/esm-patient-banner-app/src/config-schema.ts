import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  contactAttributeTypes: {
    _type: Type.Array,
    _description: 'The UUIDs of person attribute types that capture contact information',
    _default: [],
    _elements: {
      _type: Type.UUID,
    },
  },
  excludePatientIdentifierCodeTypes: {
    uuids: {
      _type: Type.Array,
      _description: 'The UUIDs of patient identifier types that should be excluded from patient banner.',
      _default: [],
      _elements: {
        _type: Type.UUID,
      },
    },
  },
  useRelationshipNameLink: {
    _type: Type.Boolean,
    _description: "Whether to use the relationship name as a link to the person's patient chart",
    _default: false,
  },
  showPrintIdentifierStickerButton: {
    _type: Type.Boolean,
    _description: "Whether to display the 'Print identifier sticker' button in the patient banner",
    _default: false,
  },
  printIdentifierStickerFields: {
    _type: Type.Array,
    _description: 'Patient demographics to include in the identifier sticker printout',
    _default: ['name', 'dateOfBirth', 'age', 'gender', 'identifier'],
    _elements: {
      _type: Type.String,
    },
  },
  printIdentifierStickerSize: {
    _type: Type.String,
    _description:
      'Specifies the paper size for printing the sticker. You can define the size using units (e.g., mm, in) or named sizes (e.g., "148mm 210mm", "A1", "A2", "A4", "A5").',
    _default: '4in 6in',
  },
};

export interface ConfigObject {
  contactAttributeTypes: Array<string>;
  excludePatientIdentifierCodeTypes: {
    uuids: Array<string>;
  };
  customAddressLabels: Object;
  useRelationshipNameLink: boolean;
  showPrintIdentifierStickerButton: boolean;
  printIdentifierStickerFields: Array<string>;
  printIdentifierStickerSize: string;
}
