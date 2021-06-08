export function launchStartVisitPrompt() {
  window.dispatchEvent(
    new CustomEvent('visit-dialog', {
      detail: {
        type: 'prompt',
      },
    }),
  );
}
