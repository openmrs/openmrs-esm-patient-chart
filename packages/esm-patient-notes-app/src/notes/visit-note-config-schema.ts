import { Type } from '@openmrs/esm-framework';

export default {
  clinicianEncounterRole: {
    _type: Type.UUID,
    _default: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
  },
  visitDiagnosesConceptUuid: {
    _type: Type.ConceptUuid,
    _default: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  encounterNoteTextConceptUuid: {
    _type: Type.ConceptUuid,
    _default: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  encounterTypeUuid: {
    _type: Type.UUID,
    _default: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
  },
  formConceptUuid: {
    _type: Type.ConceptUuid,
    _default: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
  },
};

export interface VisitNoteConfigObject {
  clinicianEncounterRole: string;
  encounterNoteTextConceptUuid: string;
  encounterTypeUuid: string;
  formConceptUuid: string;
  visitDiagnosesConceptUuid: string;
}
