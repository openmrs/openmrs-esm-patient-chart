import React, { useState } from 'react';

interface VisitDialogType {
  type: 'start' | 'prompt' | 'end' | 'close';
}

export function useVisitDialog(patientUuid: string) {
  const [visitDialogType, setVisitDialogType] = useState<VisitDialogType>({ type: 'close' });

  React.useEffect(() => {
    const handler = (ev: CustomEvent) => {
      const { type, state = {} } = ev.detail;

      switch (type) {
        case 'start':
          return setVisitDialogType({ type: 'start' });
        case 'prompt':
          return setVisitDialogType({ type: 'prompt' });
        case 'end':
          return setVisitDialogType({ type: 'end' });
        case 'close':
          return setVisitDialogType({ type: 'close' });
      }
    };
    window.addEventListener('visit-dialog', handler);
    return () => window.removeEventListener('visit-dialog', handler);
  }, [patientUuid]);

  console.log(visitDialogType);

  return visitDialogType;
}
