import { Type, validator } from '@openmrs/esm-framework';

export const attachmentsConfigSchema = {
  maxFileSize: {
    _type: Type.Number,
    _description: 'Maximum allowed upload file size (in MB)',
    _default: 1,
    _validators: [validator((v: number) => v > 0, 'Must be greater than zero')],
  },
};
