import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  dataSources: {
    monthlySchedule: {
      _type: Type.Boolean,
      _default: false,
      _description: 'Whether to inject monthly scheduled appointment data source to form-entry engine',
    },
  },
  baseEtlUrl: {
    _type: Type.String,
    _default: '/etl-latest/etl/',
    _description: 'Custom URL to load resources required for form-entry',
  },
};
