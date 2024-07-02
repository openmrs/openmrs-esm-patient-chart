import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  printOptions: {
    showPrintButton: {
      _type: Type.Boolean,
      _default: false,
      _description:
        'Determines whether or not to display the Print button for the form. If set to true, a Print button gets shown in the header of the forms workspace. When clicked, this button enables the user to print out the contents of the form',
    },
    logo: {
      alt: {
        _type: Type.String,
        _default: 'Logo',
        _description: 'Alt text, shown on hover',
      },
      name: {
        _type: Type.String,
        _default: null,
        _description: 'The organization name displayed when image is absent',
      },
      src: {
        _type: Type.String,
        _default: null,
        _description: 'A path or URL to an image. Defaults to the OpenMRS SVG sprite.',
      },
    },
  },
};

export interface ConfigObject {
  printOptions: {
    showPrintButton: boolean;
    logo: {
      alt: string;
      name: string;
      src: string;
    };
  };
}
