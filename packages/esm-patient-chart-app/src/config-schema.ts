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
  disableEmptyTabs: {
    _type: Type.Boolean,
    _default: false,
    _description: 'Disable notes/tests/medications/encounters tabs when empty',
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
  visitAttributeTypes: {
    _type: Type.Array,
    _description: 'List of visit attribute types to be shown when filling visit form',
    _elements: {
      uuid: {
        _type: Type.UUID,
        _description: 'UUID of the visit attribute type',
      },
      required: {
        _type: Type.Boolean,
        _description: 'Whether the attribute type field is required or not',
        _default: false,
      },
      displayInThePatientBanner: {
        _type: Type.Boolean,
        _description: "Whether we should show this visit attribute's value in the patient banner",
        _default: true,
      },
    },
    _default: [
      {
        uuid: '57ea0cbb-064f-4d09-8cf4-e8228700491c',
        required: false,
        displayInThePatientBanner: true,
      },
      {
        uuid: 'aac48226-d143-4274-80e0-264db4e368ee',
        required: false,
        displayInThePatientBanner: true,
      },
    ],
  },
  showServiceQueueFields: {
    _type: Type.Boolean,
    _description: 'Whether start visit form should display service queue fields`',
    _default: false,
  },
  priorityConceptSetUuid: {
    _type: Type.ConceptUuid,
    _description: 'The UUID of the priorities for the queues.',
    _default: '9e123c90-76ac-4eaa-8d40-35577781eb46',
  },
  defaultPriorityConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The UUID of the default priority for the queues eg Not urgent.',
    _default: '9e123c90-76ac-4eaa-8d40-35577781eb46',
  },
  serviceConceptSetUuid: {
    _type: Type.ConceptUuid,
    _description: 'The UUID of the services for the queues.',
    _default: 'f9c6a3f8-a5d0-4034-ac77-e413c4b3c620',
  },
  statusConceptSetUuid: {
    _type: Type.ConceptUuid,
    _description: 'The UUID of the statuses for the queues.',
    _default: '13c9b9fb-3396-4139-98e1-59938d544168',
  },
  defaultStatusConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The UUID of the default status for the queues eg Waiting.',
    _default: '136203AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
};

export interface ChartConfig {
  offlineVisitTypeUuid: string;
  visitTypeResourceUrl: string;
  showRecommendedVisitTypeTab: boolean;
  visitAttributeTypes: Array<{
    uuid: string;
    required: boolean;
    displayInThePatientBanner: boolean;
  }>;
  showServiceQueueFields: boolean;
  priorityConceptSetUuid: string;
  defaultPriorityConceptUuid: string;
  serviceConceptSetUuid: string;
  statusConceptSetUuid: string;
  defaultStatusConceptUuid: string;
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
