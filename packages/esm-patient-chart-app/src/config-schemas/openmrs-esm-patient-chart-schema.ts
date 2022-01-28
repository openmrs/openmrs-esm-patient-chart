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
};

export interface ChartConfig {}
