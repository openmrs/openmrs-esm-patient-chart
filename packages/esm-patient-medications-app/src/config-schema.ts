import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  durationUnitsConcept: {
    _type: Type.ConceptUuid,
    _description:
      'A concept which has Answers that are medication duration units (for example, days, weeks, or months).',
    _default: '1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  careSettingUuid: {
    _type: Type.UUID,
    _description: 'Only orders corresponding to this care setting will be displayed.',
    _default: '6f0c9a92-6f24-11e3-af88-005056821db0',
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
};

export interface ConfigObject {
  durationUnitsConcept: string;
  careSettingUuid: string;
  daysDurationUnit: {
    uuid: string;
    display: string;
  };
}
