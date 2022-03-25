import React, { useEffect, useState } from 'react';
import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import {
  DefaultWorkspaceProps,
  FormEntryProps,
  formEntrySub,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';

const FormEntry: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { patient } = usePatient(patientUuid);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const [selectedForm, setSelectedForm] = useState<FormEntryProps>(null);

  useEffect(() => {
    const sub = formEntrySub.subscribe((form) => setSelectedForm(form));
    return () => sub.unsubscribe();
  }, []);

  return (
    <div>
      {selectedForm && patientUuid && patient && currentVisit && (
        <ExtensionSlot
          extensionSlotName="form-widget-slot"
          state={{
            view: 'form',
            formUuid: selectedForm.formUuid,
            visitUuid: currentVisit.uuid,
            visitTypeUuid: currentVisit.visitType?.uuid,
            patientUuid,
            patient,
            encounterUuid: selectedForm?.encounterUuid ?? null,
            closeWorkspace,
          }}
        />
      )}
    </div>
  );
};

export default FormEntry;
