import React, { useCallback, useEffect, useState } from 'react';
import { detach, ExtensionSlot, useConnectivity, useVisit } from '@openmrs/esm-framework';
import { FormEntryProps, formEntrySub } from './forms-utils';

interface FormProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const FormEntry: React.FC<FormProps> = ({ patientUuid, patient }) => {
  const isOffline = useConnectivity();
  const { currentVisit } = useVisit(patientUuid);
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
      {selectedForm && (
        <ExtensionSlot
          extensionSlotName="form-widget-slot"
          state={{
            formUuid: selectedForm.formUuid,
            visitUuid: selectedForm.visitUuid,
            encounterUuid: null,
            visitTypeUuid: currentVisit?.visitType?.uuid,
            view: 'form',
            patient: selectedForm.patient,
            closeWorkspace: closeWorkspace,
            isOffline: isOffline,
          }}
        />
      )}
    </div>
  );
};

export default FormEntry;
