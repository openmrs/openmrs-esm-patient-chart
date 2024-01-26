import { Type } from '@openmrs/esm-framework';
export const attachmentsConfigSchema = {
  fileSize: {
    _type: Type.Number,
    _description: 'Max file size limit to upload (in MB)',
    _default: 1,
  },
};
