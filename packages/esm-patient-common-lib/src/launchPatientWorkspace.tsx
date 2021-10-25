export const launchPatientWorkspace = (extensionSlotName: string) => {
  window.dispatchEvent(
    new CustomEvent('workspace-dialog', {
      detail: {
        state: { extensionSlotName },
      },
    }),
  );
};
