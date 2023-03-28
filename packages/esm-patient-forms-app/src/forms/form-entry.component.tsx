import React, { useEffect, useMemo, useState } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import {
  DefaultWorkspaceProps,
  FormEntryProps,
  formEntrySub,
  usePatientOrOfflineRegisteredPatient,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';

interface FormEntryComponentProps extends DefaultWorkspaceProps {
  mutateForm: () => void;
}

const FormEntry: React.FC<FormEntryComponentProps> = ({ patientUuid, closeWorkspace, mutateForm }) => {
  const { patient } = usePatientOrOfflineRegisteredPatient(patientUuid);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const [selectedForm, setSelectedForm] = useState<FormEntryProps>(null);

  const state = useMemo(
    () => ({
      view: 'form',
      formUuid: selectedForm?.formUuid ?? null,
      visitUuid: selectedForm?.visitUuid ?? currentVisit?.uuid ?? null,
      visitTypeUuid: selectedForm?.visitTypeUuid ?? currentVisit?.visitType?.uuid ?? null,
      patientUuid: patientUuid ?? null,
      patient,
      encounterUuid: selectedForm?.encounterUuid ?? null,
      closeWorkspace: () => {
        mutateForm();
        closeWorkspace();
      },
    }),
    [
      selectedForm?.formUuid,
      selectedForm?.visitUuid,
      selectedForm?.visitTypeUuid,
      selectedForm?.encounterUuid,
      currentVisit?.uuid,
      currentVisit?.visitType?.uuid,
      patientUuid,
      patient,
      mutateForm,
      closeWorkspace,
    ],
  );

  useEffect(() => {
    const sub = formEntrySub.subscribe((form) => setSelectedForm(form));
    return () => sub.unsubscribe();
  }, []);

  return (
    <div>
      {selectedForm && patientUuid && patient && <ExtensionSlot extensionSlotName="form-widget-slot" state={state} />}
    </div>
  );
};

export default FormEntry;
