import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  clinicalViews: {
    _type: Type.Array,
    _elements: {
      slot: { _type: Type.String },
      slotName: { _type: Type.String },
    },
    _default: [{ slot: 'All', slotName: '' }],
  },
};
