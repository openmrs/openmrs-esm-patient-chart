import { detachAll } from '@openmrs/esm-framework';

export const clearWorkspace = (extensionSlotName) => {
  detachAll(extensionSlotName);
};
