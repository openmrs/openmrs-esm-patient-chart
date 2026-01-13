import { Type, validators } from '@openmrs/esm-framework';

export const configSchema = {
  // Add your configuration schema here
  // Example:
  // logo: {
  //   src: {
  //     _type: Type.String,
  //     _default: '',
  //     _description: 'The path or URL to the logo image',
  //     _validators: [validators.isUrl],
  //   },
  //   alt: {
  //     _type: Type.String,
  //     _default: 'Logo',
  //     _description: 'The alternative text for the logo image',
  //   },
  // },
};

export type ConfigSchema = {
  // TypeScript type derived from schema
  // Example:
  // logo: {
  //   src: string;
  //   alt: string;
  // };
};
