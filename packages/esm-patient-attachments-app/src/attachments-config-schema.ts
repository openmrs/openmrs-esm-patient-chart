import { Type, validator } from '@openmrs/esm-framework';

export const attachmentsConfigSchema = {
  maxFileSize: {
    _type: Type.Number,
    _description:
      'Deprecated. The upload limit is read from the backend attachments.maxUploadFileSize global property.',
    _default: 1,
    _validators: [validator((v: unknown) => typeof v === 'number' && v > 0, 'Must be greater than zero')],
  },
};
