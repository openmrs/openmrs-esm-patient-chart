import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  procedureEncounterType: {
    _type: Type.UUID,
    _description: 'The encounter type of the encounter encapsulating orders. Defaults to the "Order" encounter type.',
    _default: '6f8393e7-cf3d-45e1-abc1-d83858a18d8c',
  },

  procedureFormUuid: {
    _type: Type.UUID,
    _description: 'This is the uuid of the procedures form',
    _default: '74d8d0e7-1c81-4c6c-bc5f-6d50eeb2a851',
  },
  dayProcedurePerformedUuid: {
    _type: Type.UUID,
    _description: 'UUID of the backing concept for Date when procedure was performed',
    _default: '160715AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  nameOfProcedurePerformedUuid: {
    _type: Type.UUID,
    _description: 'UUID of the backing concept for Name of procedure or test performed',
    _default: '1651AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
};

export interface ConfigObject {
  procedureEncounterType: string;
  procedureFormUuid: string;
  dayProcedurePerformedUuid: string;
  nameOfProcedurePerformedUuid: string;
}
