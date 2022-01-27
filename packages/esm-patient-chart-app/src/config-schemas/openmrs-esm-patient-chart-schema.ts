import { Type } from '@openmrs/esm-framework';

export const esmPatientChartSchema = {
  offlineVisitTypeUuid: {
    _type: Type.UUID,
    _description: 'The UUID of the visit type to be used for the automatically created offline visits.',
    _default: 'a22733fa-3501-4020-a520-da024eeff088',
  },
};

export interface ChartConfig {
  offlineVisitTypeUuid: string;
}
