import { showModal } from '@openmrs/esm-framework';

export function launchPayBillPrompt() {
  const dispose = showModal('pay-bill-dialog', {
    closeModal: () => dispose(),
  });
}
