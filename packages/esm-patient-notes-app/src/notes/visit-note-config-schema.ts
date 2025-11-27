import { Type } from '@openmrs/esm-framework';

export default {
  clinicianEncounterRole: {
    _type: Type.UUID,
    _default: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
    _description: 'Doctor or Nurse who is the primary provider for an encounter, and will sign the note',
  },
  visitDiagnosesConceptUuid: {
    _type: Type.ConceptUuid,
    _default: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    _description: 'The set of diagnoses that were either addressed or diagnosed during the current visit',
  },
  encounterNoteTextConceptUuid: {
    _type: Type.ConceptUuid,
    _default: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    _description: 'Free text note field intended to capture unstructured description of the patient encounter',
  },
  encounterTypeUuid: {
    _type: Type.UUID,
    _default: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
    _description:
      'Encounter where a full or abbreviated examination is done, usually leading to a presumptive or confirmed diagnosis, recorded by the examining clinician.',
  },
  formConceptUuid: {
    _type: Type.UUID,
    _default: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
    _description: 'The UUID of the Visit Note form to be associated with visit note encounters',
  },
};

export interface VisitNoteConfigObject {
  clinicianEncounterRole: string;
  encounterNoteTextConceptUuid: string;
  encounterTypeUuid: string;
  formConceptUuid: string;
  visitDiagnosesConceptUuid: string;
}
