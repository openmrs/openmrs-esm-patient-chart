import React, { useState } from 'react';

interface VisitDialogType {
  type: 'start' | 'prompt' | 'end' | 'close';
  state?: {};
}

export function useVisitDialog(patientUuid: string) {
  const [visitDialogType, setVisitDialogType] = useState<VisitDialogType>({ type: 'close', state: {} });

  React.useEffect(() => {
    const handler = (ev: CustomEvent) => {
      const { type, state = {} } = ev.detail;

      switch (type) {
        case 'start':
          return setVisitDialogType({ type: 'start', state });
        case 'prompt':
          return setVisitDialogType({ type: 'prompt', state });
        case 'end':
          return setVisitDialogType({ type: 'end', state });
        case 'close':
          return setVisitDialogType({ type: 'close', state });
      }
    };
    window.addEventListener('visit-dialog', handler);
    return () => window.removeEventListener('visit-dialog', handler);
  }, [patientUuid]);

  return visitDialogType;
}
