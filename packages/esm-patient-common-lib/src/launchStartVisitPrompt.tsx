import { showModal } from '@openmrs/esm-framework';

export async function launchStartVisitPrompt(onVisitStarted?: () => void) {

  const dispose = showModal('start-visit-dialog', {
    closeModal: () => dispose(),
    onVisitStarted,
  });
}
