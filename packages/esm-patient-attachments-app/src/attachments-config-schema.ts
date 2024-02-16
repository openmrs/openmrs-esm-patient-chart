import { Type } from '@openmrs/esm-framework';

export const attachmentsConfigSchema = {
  maxFileSize: {
    _type: Type.Number,
    _description: 'Maximum allowed upload file size (in MB)',
    _default: 1,
  },
};
