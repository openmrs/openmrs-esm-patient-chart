import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  allowAssigningProviderRole: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Allow assigning tasks to provider roles. Requires module webservices.rest version >=3.0.1',
  },
};

export type Config = {
  allowAssigningProviderRole: boolean;
};
