import { Type, validators } from '@openmrs/esm-framework';

export const configSchema = {
  concepts: {
    _type: Type.Object,
    _description: 'Concepts used in the Growth Chart app',
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
