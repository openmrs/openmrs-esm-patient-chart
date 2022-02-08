import React, { useEffect, useState } from 'react';
import { ExtensionSlot, useConnectivity, useVisit } from '@openmrs/esm-framework';
import { DefaultWorkspaceProps, FormEntryProps, formEntrySub } from '@openmrs/esm-patient-common-lib';

const FormEntry: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const isOffline = useConnectivity();
  const { currentVisit } = useVisit(patientUuid);
  const [selectedForm, setSelectedForm] = useState<FormEntryProps>(null);

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
            patientUuid,
            patient: selectedForm?.patient,
            closeWorkspace,
            isOffline: isOffline,
          }}
        />
      )}
    </div>
  );
};

export default FormEntry;
