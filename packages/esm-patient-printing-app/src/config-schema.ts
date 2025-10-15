import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  showPrintIdentifierStickerButton: {
    _type: Type.Boolean,
    _description: "Whether to display the 'Print identifier sticker' button in the patient banner",
    _default: true,
  },
};

export interface ConfigObject {
  showPrintIdentifierStickerButton: boolean;
}
