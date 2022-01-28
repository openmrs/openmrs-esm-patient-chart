import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  dataSources: {
    monthlySchedule: {
      _type: Type.Boolean,
      _default: false,
      _description:
        'Whether to use monthly scheduled appointment data source in form-entry engine. Requires `appointmentsResourceUrl`.',
    },
    fileUploader: {
      _type: Type.Boolean,
      _default: false,
      _description:
        'Whether to use custom file uploader data source in form-entry engine. Requires `fileUploaderResourceUrl`',
    },
  },
  appointmentsResourceUrl: {
    _type: Type.String,
    _default: '/etl-latest/etl/get-monthly-schedule',
    _description:
      'Custom URL to load resources required for appointment monthly schedule feature (under `dataSources`).',
  },
  fileUploaderResourceUrl: {
    _type: Type.String,
    _default: '/etl-latest/etl/',
    _description:
      'Custom URL to load resources required for appointment monthly schedule feature (under `dataSources`).',
  },
};
