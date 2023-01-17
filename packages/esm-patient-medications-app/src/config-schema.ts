import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  defaultDurationConcept: {
    uuid: {
      _type: Type.ConceptUuid,
      _default: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      _description: 'The concept for that medication duration unit is specified here.',
    },
    display: {
      _type: Type.String,
      _description: 'The text to display for default duration unit.',
      _default: 'Days',
    },
  },
  careSettingUuid: {
    _type: Type.UUID,
    _description: 'Only orders corresponding to this care setting will be displayed.',
    _default: '6f0c9a92-6f24-11e3-af88-005056821db0',
  },
  drugOrderEncounterType: {
    _type: Type.UUID,
    _description: 'The encounter type of the encounter encapsulating drug orders',
    _default: '39da3525-afe4-45ff-8977-c53b7b359158',
  },
  clinicianEncounterRole: {
    _type: Type.UUID,
    _description: 'Encounter role required by clinician to dispense medication(s)',
    _default: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
  },
  drugOrderTypeUUID: {
    _type: Type.UUID,
    _description: "UUID for the 'Drug' order type to fetch medications",
    _default: '131168f4-15f5-102d-96e4-000c29c2a5d7',
  },
  defaultOrderFrequencyConcept: {
    uuid: {
      _type: Type.ConceptUuid,
      _default: '160862AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      _description: 'The concept for that medication frequency unit is specified here.',
    },
    display: {
      _type: Type.String,
      _description: 'The text to display for default frequency unit.',
      _default: 'Once daily',
    },
  },
  defaultDrugRouteConcept: {
    uuid: {
      _type: Type.ConceptUuid,
      _default: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      _description: 'The concept for that medication route unit is specified here.',
    },
    display: {
      _type: Type.String,
      _description: 'The text to display for default drug route unit.',
      _default: 'Oral',
    },
  },
};

export interface ConfigConcept {
  uuid: string;
  display: string;
}
export interface ConfigObject {
  careSettingUuid: string;
  drugOrderEncounterType: string;
  clinicianEncounterRole: string;
  drugOrderTypeUUID: string;
  defaultDurationConcept: ConfigConcept;
  defaultOrderFrequencyConcept: ConfigConcept;
  defaultDrugRouteConcept: ConfigConcept;
}
