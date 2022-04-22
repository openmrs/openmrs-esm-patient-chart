import { showModal } from '@openmrs/esm-framework';

export function launchStartVisitPrompt() {
  const dispose = showModal('start-visit-dialog', {
    closeModal: () => dispose(),
  });
}
