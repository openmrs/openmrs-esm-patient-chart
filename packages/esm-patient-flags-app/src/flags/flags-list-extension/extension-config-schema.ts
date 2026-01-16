import { Type } from '@openmrs/esm-framework';

export const flagsListExtensionConfigSchema = {
  tags: {
    _type: Type.Array,
    _default: [],
    _description:
      'Filter flags to only show those with at least one of the specified tag names. If empty, all flags are shown.',
    _elements: {
      _type: Type.String,
    },
  },
};

export interface FlagsListExtensionConfig {
  tags: Array<string>;
}
