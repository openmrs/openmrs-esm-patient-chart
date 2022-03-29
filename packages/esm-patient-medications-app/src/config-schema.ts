import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  durationUnitsConcept: {
    _type: Type.String,
    _description: 'Concept for duration units',
    _default: '1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  careSettingUuid: {
    _type: Type.String,
    _description: 'Uuid setting',
    _default: '6f0c9a92-6f24-11e3-af88-005056821db0',
  },
  daysDurationUnit: {
    uuid: {
      _type: Type.String,
      _description: 'Uuid',
      _default: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    display: {
      _type: Type.String,
      _description: 'Uuid setting',
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
