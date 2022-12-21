import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  durationUnitsConcept: {
    _type: Type.ConceptUuid,
    _description:
      'A concept which has Answers that are medication duration units (for example, days, weeks, or months).',
    _default: '1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  daysDurationUnit: {
    _description:
      'The default medication duration unit is days. The concept for that medication duration unit is specified here.',
    uuid: {
      _type: Type.UUID,
      _default: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    display: {
      _type: Type.String,
      _description: 'The text to display in the medication duration units menu for the "days" unit.',
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
  quantityUnitsUuid: {
    _type: Type.ConceptUuid,
    _description:
      "Concept to be used as order quantity units default value. This is necessary because this datapoint isn't captured on the dispensing form but the datamodel requires this attribute to issue an order",
    _default: '162399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
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
};

export interface ConfigObject {
  durationUnitsConcept: string;
  careSettingUuid: string;
  drugOrderEncounterType: string;
  clinicianEncounterRole: string;
  quantityUnitsUuid: string;
  daysDurationUnit: {
    uuid: string;
    display: string;
  };
  drugOrderTypeUUID: string;
}
