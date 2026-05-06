import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  procedurePageSize: {
    _type: Type.Number,
    _description: 'Default page size for the procedures table',
    _default: 5,
  },
  procedureCodedConceptClassUuid: {
    _type: Type.UUID,
    _description: 'Concept class UUID for procedure coded concepts',
    _default: '8d490bf4-c2cc-11de-8d13-0010c6dffd0f',
  },
  bodySiteConceptClassUuid: {
    _type: Type.UUID,
    _description: 'Concept class UUID for body site concepts',
    _default: '',
  },
  statusConceptClassUuid: {
    _type: Type.UUID,
    _description: 'Concept class UUID for procedure status concepts',
    _default: '',
  },
  durationUnitMinutesConceptUuid: {
    _type: Type.UUID,
    _description: 'Concept UUID representing the "minutes" duration unit',
    _default: '1733AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  durationUnitHoursConceptUuid: {
    _type: Type.UUID,
    _description: 'Concept UUID representing the "hours" duration unit',
    _default: '1822AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  durationUnitDaysConceptUuid: {
    _type: Type.UUID,
    _description: 'Concept UUID representing the "days" duration unit',
    _default: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
};

export interface ConfigObject {
  procedurePageSize: number;
  procedureCodedConceptClassUuid: string;
  bodySiteConceptClassUuid: string;
  statusConceptClassUuid: string;
  durationUnitMinutesConceptUuid: string;
  durationUnitHoursConceptUuid: string;
  durationUnitDaysConceptUuid: string;
}
