import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  orderEncounterType: {
    _type: Type.UUID,
    _description: 'The encounter type of the encounter encapsulating orders',
    _default: '39da3525-afe4-45ff-8977-c53b7b359158',
  },
  orders: {
    testOrderTypeUuid: {
      _type: Type.UUID,
      _description: "UUID for the 'Test' order type",
      _default: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
    },
  },
  obsStatuses: {
    _type: Type.Object,
    _description: 'List of observation statuses',
    _default: {
      preliminary: 'PRELIMINARY',
      amended: 'AMENDED',
      final: 'FINAL',
    },
  },
  fulfillerStatuses: {
    _type: Type.Object,
    _description: 'List of fulfiller statuses',
    _default: {
      received: 'RECEIVED',
      progress: 'IN_PROGRESS',
      exception: 'EXCEPTION',
      on_hold: 'ON_HOLD',
      declined: 'IN_PDECLINEDROGRESS',
      completed: 'COMPLETED',
    },
  },
};

export interface ConfigObject {
  orderEncounterType: string;
}
