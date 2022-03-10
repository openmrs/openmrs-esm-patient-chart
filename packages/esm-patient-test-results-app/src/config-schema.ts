import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  concepts: {
    _type: Type.Array,
    _elements: {
      conceptUuid: {
        _type: Type.UUID,
        _description: 'UUID of concept to load from /obstree',
      },
      defaultOpen: {
        _type: Type.Boolean,
        _description: 'Set default behavior of filter accordion',
      },
    },
    _default: [
      {
        conceptUuid: '5035a431-51de-40f0-8f25-4a98762eb796',
        defaultOpen: false,
      },
      {
        conceptUuid: '5566957d-9144-4fc5-8700-1882280002c1',
        defaultOpen: true,
      },
    ],
  },
};

export interface ObsTreeEntry {
  conceptUuid: string;
  defaultOpen: boolean;
}
export interface ConfigObject {
  concepts: Array<ObsTreeEntry>;
}
