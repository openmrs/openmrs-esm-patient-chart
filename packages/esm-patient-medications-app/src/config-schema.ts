import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  durationUnitsConcept: {
    _type: Type.ConceptUuid,
    _description: 'The units used to specify the duration for which the medication will be given.',
    _default: '1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  careSettingUuid: {
    _type: Type.UUID,
    _description: 'Only orders corresponding to this care setting will be displayed.',
    _default: '6f0c9a92-6f24-11e3-af88-005056821db0',
  },
  daysDurationUnit: {
    uuid: {
      _type: Type.UUID,
      _description: 'the uuid for days duration unit',
      _default: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    display: {
      _type: Type.String,
      _description: 'the display for days duration unit',
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
