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
  printIdentifierStickerSize: {
    _type: Type.String,
    _description:
      'Specifies the paper size for printing the sticker. You can define the size using units (e.g., mm, in) or named sizes (e.g., "148mm 210mm", "A1", "A2", "A4", "A5").',
    _default: '4in 6in',
  },
  showPrintIdentifierStickerButton: {
    _type: Type.Boolean,
    _description: "Whether to display the 'Print identifier sticker' button in the patient banner",
    _default: false,
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
  printIdentifierStickerSize: string;
  showPrintIdentifierStickerButton: boolean;
  useRelationshipNameLink: boolean;
}
