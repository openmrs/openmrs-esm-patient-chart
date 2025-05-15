import { Type } from '@openmrs/esm-framework';

export const esmPatientChartSchema = {
  defaultFacilityUrl: {
    _type: Type.String,
    _default: '',
    _description: 'Custom URL to load default facility if it is not in the session',
  },
  disableChangingVisitLocation: {
    _type: Type.Boolean,
    _description: 'Whether the visit location field in the Start Visit form should be view-only.',
    _default: false,
  },
  disableEmptyTabs: {
    _type: Type.Boolean,
    _default: false,
    _description: 'Disable notes/tests/medications/encounters tabs when empty',
  },
  freeTextFieldConceptUuid: {
    _default: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    _type: Type.ConceptUuid,
  },
  logo: {
    alt: {
      _type: Type.String,
      _default: 'Logo',
      _description: 'Alt text, shown on hover',
    },
    name: {
      _type: Type.String,
      _default: null,
      _description: 'The organization name displayed when image is absent',
    },
    src: {
      _type: Type.String,
      _default: null,
      _description: 'A path or URL to an image. Defaults to the OpenMRS SVG sprite.',
    },
  },
  notesConceptUuids: {
    _type: Type.Array,
    _default: ['162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
  },
  obsConceptUuidsToHide: {
    _type: Type.Array,
    _elements: {
      _type: Type.ConceptUuid,
    },
    _description:
      'An array of concept UUIDs. If an observation has a concept UUID that matches any of the ones in this array, it will be hidden from the observations list in the Encounters summary table.',
    _default: [],
  },
  offlineVisitTypeUuid: {
    _type: Type.UUID,
    _description: 'The UUID of the visit type to be used for the automatically created offline visits.',
    _default: 'a22733fa-3501-4020-a520-da024eeff088',
  },
  restrictByVisitLocationTag: {
    _type: Type.Boolean,
    _description:
      'On the start visit form, whether to restrict the visit location to locations with the Visit Location tag',
    _default: false,
  },
  showAllEncountersTab: {
    _type: Type.Boolean,
    _description: 'Shows the All Encounters Tab of Patient Visits section in Patient Chart',
    _default: true,
  },
  showExtraVisitAttributesSlot: {
    _type: Type.Boolean,
    _description:
      'Whether on start visit form should handle submission of the extra visit attributes from the extra visit attributes slot',
    _default: false,
  },
  showRecommendedVisitTypeTab: {
    _type: Type.Boolean,
    _description: 'Whether start visit form should display recommended visit type tab. Requires `visitTypeResourceUrl`',
    _default: false,
  },
  showServiceQueueFields: {
    _type: Type.Boolean,
    _description: 'Whether start visit form should display service queue fields`',
    _default: false,
  },
  showUpcomingAppointments: {
    _type: Type.Boolean,
    _description: 'Whether start visit form should display upcoming appointments',
    _default: false,
  },
  visitAttributeTypes: {
    _type: Type.Array,
    _description: 'List of visit attribute types shown when filling the visit form',
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
  visitDiagnosisConceptUuid: {
    _default: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    _type: Type.ConceptUuid,
  },
  visitTypeResourceUrl: {
    _type: Type.String,
    _default: '/etl-latest/etl/patient/',
    _description: 'Custom URL to load resources required for showing recommended visit types',
  },
  trueConceptUuid: {
    _type: Type.String,
    _description: 'Default concept uuid for true in forms',
    _default: '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  falseConceptUuid: {
    _type: Type.String,
    _description: 'Default concept uuid for false in forms',
    _default: '1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  otherConceptUuid: {
    _type: Type.String,
    _description: 'Default concept uuid for other in forms',
    _default: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
};

export interface ChartConfig {
  defaultFacilityUrl: string;
  disableChangingVisitLocation: boolean;
  freeTextFieldConceptUuid: string;
  logo: {
    alt: string;
    name: string;
    src: string;
  };
  notesConceptUuids: string[];
  offlineVisitTypeUuid: string;
  restrictByVisitLocationTag: boolean;
  showAllEncountersTab: boolean;
  showExtraVisitAttributesSlot: boolean;
  showRecommendedVisitTypeTab: boolean;
  showServiceQueueFields: boolean; // used by extension from esm-service-queues-app
  showUpcomingAppointments: boolean; // used by extension from esm-appointments-app
  visitTypeResourceUrl: string;
  visitAttributeTypes: Array<{
    displayInThePatientBanner: boolean;
    required: boolean;
    showWhenExpression?: string;
    uuid: string;
  }>;
  visitDiagnosisConceptUuid: string;
  trueConceptUuid: string;
  falseConceptUuid: string;
  otherConceptUuid: string;
}
