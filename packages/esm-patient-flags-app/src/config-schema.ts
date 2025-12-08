import { Type } from '@openmrs/esm-framework';

export interface ConfigObject {}

export const configSchema = {
  allowFlagDeletion: {
    _type: Type.Boolean,
    _default: true,
    _description:
      'If true, an edit button will be shown with the flags list. This edit button will launch a workspace that allows the user to hide/delete a flag for a particular patient. If the flag is generated again, it will reappear.',
  },
};
