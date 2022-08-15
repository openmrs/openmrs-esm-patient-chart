import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  dataSources: {
    monthlySchedule: {
      _type: 'Boolean',
      _default: false,
      _description:
        'Whether to use monthly scheduled appointment data source in form-entry engine. Requires `appointmentsResourceUrl`.',
    },
  },
  appointmentsResourceUrl: {
    _type: 'String',
    _default: '/etl-latest/etl/get-monthly-schedule',
    _description:
      'Custom URL to load resources required for appointment monthly schedule feature (under `dataSources`).',
  },
};
