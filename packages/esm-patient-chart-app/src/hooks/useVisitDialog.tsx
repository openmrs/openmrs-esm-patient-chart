import React from 'react';
import { newModalItem } from '../visit/visit-dialog.resource';
import { EndVisitConfirmation, StartVisitConfirmation } from '../visit/visit-button.component';

function createVisitDialog(patientUuid: string) {
  return (ev: CustomEvent) => {
    const { type, state = {} } = ev.detail;

    switch (type) {
      case 'start':
        return newModalItem(state);
      case 'prompt':
        return newModalItem({
          component: <StartVisitConfirmation patientUuid={patientUuid} newModalItem={newModalItem} />,
          name: 'Prompt start Visit',
          props: { closeComponent: () => state.onPromptClosed?.() },
        });
      case 'end':
        return newModalItem({
          component: (
            <EndVisitConfirmation patientUuid={patientUuid} visitData={state.visitData} newModalItem={newModalItem} />
          ),
          name: 'Prompt end Visit',
          props: { closeComponent: () => state.onPromptClosed?.() },
        });
    }
  };
}

export function useVisitDialog(patientUuid: string) {
  React.useEffect(() => {
    const handler = createVisitDialog(patientUuid);
    window.addEventListener('visit-dialog', handler);
    return () => window.removeEventListener('visit-dialog', handler);
  }, [patientUuid]);
}
