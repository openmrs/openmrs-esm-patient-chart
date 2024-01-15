import { Type } from '@openmrs/esm-framework';
export const attachmentsConfigSchema = {
  fileSize: {
    _type: Type.Number,
    _description: 'Max file size limit to upload (in MB)',
    _default: 10,
  },
  allowedExtensions: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
    _description: 'Allowed extensions for attachments',
    _default: undefined,
  },
};
