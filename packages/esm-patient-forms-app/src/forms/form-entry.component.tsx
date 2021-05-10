import React, { useCallback, useEffect, useState } from 'react';
import { detach, ExtensionSlot } from '@openmrs/esm-framework';
import { FormEntryProps, formEntrySub } from './forms-utils';

const FormEntry: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<FormEntryProps>(null);
  const closeWorkspace = useCallback(() => {
    detach('patient-chart-workspace-slot', 'patient-form-entry-workspace');
  }, []);

  useEffect(() => {
    const sub = formEntrySub.subscribe((form) => setSelectedForm(form));
    return () => sub.unsubscribe();
  }, []);

  return (
    <div>
      {selectedForm?.formUuid && (
        <ExtensionSlot
          extensionSlotName="form-widget-slot"
          state={{
            formUuid: selectedForm.formUuid,
            encounterUuid: null,
            view: 'form',
            patient: selectedForm.patient,
            closeWorkspace: closeWorkspace,
          }}
        />
      )}
    </div>
  );
};

export default FormEntry;
