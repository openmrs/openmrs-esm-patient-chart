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
        conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '678AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '729AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '1132AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '857AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '790AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '1133AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '159644AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '161482AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '1134AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '1135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
      },
      {
        conceptUuid: '161505AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        defaultOpen: false,
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
