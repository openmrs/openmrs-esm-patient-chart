import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  concepts: {
    _type: Type.Object,
    _description: 'Concept used to record weight',
    _default: {
      weightUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
};

export type ConfigObject = {
  concepts: {
    weightUuid: string;
  };
};
