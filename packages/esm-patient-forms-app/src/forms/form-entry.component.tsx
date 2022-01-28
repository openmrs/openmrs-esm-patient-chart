import React, { useCallback, useEffect, useState } from 'react';
import { detach, ExtensionSlot, useConnectivity, useVisit } from '@openmrs/esm-framework';
import { FormEntryProps, formEntrySub } from '@openmrs/esm-patient-common-lib';

interface FormProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const FormEntry: React.FC<FormProps> = ({ patientUuid }) => {
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
      {selectedForm && patientUuid && selectedForm?.patient && (
        <ExtensionSlot
          extensionSlotName="form-widget-slot"
          state={{
            formUuid: selectedForm.formUuid,
            visitUuid: selectedForm.visitUuid,
            encounterUuid: selectedForm?.encounterUuid ? selectedForm.encounterUuid : null,
            visitTypeUuid: currentVisit?.visitType?.uuid,
            view: 'form',
            patientUuid: patientUuid,
            patient: selectedForm?.patient,
            closeWorkspace: closeWorkspace,
            isOffline: isOffline,
          }}
        />
      )}
    </div>
  );
};

export default FormEntry;
