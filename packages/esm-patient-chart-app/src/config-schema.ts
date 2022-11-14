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
  showAllEncountersTab: {
    _type: Type.Boolean,
    _description: 'Shows the All Encounters Tab of Patient Visits section in Patient Chart',
    _default: false,
  },
  startVisitLabel: {
    _type: Type.String,
    _description: 'Custom label to use on the start visit actions',
    _default: '',
  },
  showServiceQueueFields: {
    _type: Type.Boolean,
    _description: 'Whether start visit form should display service queue fields`',
    _default: true,
  },
  priorityConceptSetUuid: {
    _type: Type.ConceptUuid,
    _default: '9e123c90-76ac-4eaa-8d40-35577781eb46',
  },
  serviceConceptSetUuid: {
    _type: Type.ConceptUuid,
    _default: '952c329c-c195-44c7-8662-85b1e82bc4ad',
  },
  statusConceptSetUuid: {
    _type: Type.ConceptUuid,
    _default: '13c9b9fb-3396-4139-98e1-59938d544168',
  },
};

export interface ChartConfig {
  offlineVisitTypeUuid: string;
  visitTypeResourceUrl: string;
  showRecommendedVisitTypeTab: boolean;
  showServiceQueueFields: boolean;
  priorityConceptSetUuid: string;
  serviceConceptSetUuid: string;
  statusConceptSetUuid: string;
}

export const configSchema = {
  contactAttributeType: {
    _type: Type.UUID,
    _description:
      'The Uuids of person attribute-type that captures contact information `e.g Next of kin contact details`',
    _default: [],
  },
};

export interface ConfigObject {
  contactAttributeType: Array<string>;
}
