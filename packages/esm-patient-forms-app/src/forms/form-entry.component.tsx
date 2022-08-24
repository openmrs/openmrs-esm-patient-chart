import React, { useEffect, useMemo, useState } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import {
  DefaultWorkspaceProps,
  FormEntryProps,
  formEntrySub,
  usePatientOrOfflineRegisteredPatient,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';

const FormEntry: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { patient } = usePatientOrOfflineRegisteredPatient(patientUuid);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const [selectedForm, setSelectedForm] = useState<FormEntryProps>(null);

  const state = useMemo(
    () => ({
      view: 'form',
      formUuid: selectedForm?.formUuid ?? null,
      visitUuid: currentVisit.uuid ?? null,
      visitTypeUuid: currentVisit.visitType?.uuid ?? null,
      patientUuid: patientUuid ?? null,
      patient,
      encounterUuid: selectedForm?.encounterUuid ?? null,
      closeWorkspace,
    }),
    [selectedForm, currentVisit, patientUuid, patient, closeWorkspace],
  );

  useEffect(() => {
    const sub = formEntrySub.subscribe((form) => setSelectedForm(form));
    return () => sub.unsubscribe();
  }, []);

  return (
    <div>
      {selectedForm && patientUuid && patient && currentVisit && (
        <ExtensionSlot extensionSlotName="form-widget-slot" state={state} />
      )}
    </div>
  );
};

export default FormEntry;
