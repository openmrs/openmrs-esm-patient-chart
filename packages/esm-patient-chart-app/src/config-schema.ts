import { Type } from '@openmrs/esm-framework';

export const esmPatientChartSchema = {
  visitDiagnosisConceptUuid: {
    _default: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    _type: Type.ConceptUuid,
  },
  problemListConceptUuid: {
    _default: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    _type: Type.ConceptUuid,
  },
  diagnosisOrderConceptUuid: {
    _default: '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    _type: Type.ConceptUuid,
  },
  notesConceptUuids: {
    _type: Type.Array,
    _default: ['162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
  },
  offlineVisitTypeUuid: {
    _type: Type.UUID,
    _description: 'The UUID of the visit type to be used for the automatically created offline visits.',
    _default: 'a22733fa-3501-4020-a520-da024eeff088',
  },
  showRecommendedVisitTypeTab: {
    _type: Type.Boolean,
    _description: 'Whether start visit form should display recommended visit type tab. Requires `visitTypeResourceUrl`',
    _default: false,
  },
  visitTypeResourceUrl: {
    _type: Type.String,
    _default: '/etl-latest/etl/patient/',
    _description: 'Custom URL to load resources required for showing recommended visit types',
  },
  navGroup: {
    _description: 'Only for the nav group extension.',
    title: {
      _type: Type.String,
      _description: 'The title of the nav group.',
      _default: 'My Group',
    },
    slotName: {
      _type: Type.String,
      _description: 'The name of the slot to create, which links can be added to.',
      _default: 'my-group-nav-slot',
    },
  },
};

export interface ChartConfig {
  offlineVisitTypeUuid: string;
  visitTypeResourceUrl: string;
  showRecommendedVisitTypeTab: boolean;
}
