import React, { useEffect, useMemo, useState } from 'react';
import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import {
  DefaultWorkspaceProps,
  FormEntryProps,
  formEntrySub,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';

interface FormEntryComponentProps extends DefaultWorkspaceProps {
  mutateForm: () => void;
}

const FormEntry: React.FC<FormEntryComponentProps> = ({ patientUuid, closeWorkspace, mutateForm }) => {
  const { patient } = usePatient(patientUuid);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const [selectedForm, setSelectedForm] = useState<FormEntryProps>(null);
  const [showForm, setShowForm] = useState(true);

  const state = useMemo(
    () => ({
      view: 'form',
      formUuid: selectedForm?.formUuid ?? null,
      visitUuid: selectedForm?.visitUuid ?? currentVisit?.uuid ?? null,
      visitTypeUuid: selectedForm?.visitTypeUuid ?? currentVisit?.visitType?.uuid ?? null,
      visitStartDatetime: selectedForm?.visitStartDatetime ?? currentVisit?.startDatetime ?? null,
      visitStopDatetime: selectedForm?.visitStopDatetime ?? currentVisit?.stopDatetime ?? null,
      patientUuid: patientUuid ?? null,
      patient,
      encounterUuid: selectedForm?.encounterUuid ?? null,
      closeWorkspace: () => {
        typeof mutateForm === 'function' && mutateForm();
        closeWorkspace();
      },
    }),
    [
      selectedForm?.formUuid,
      selectedForm?.visitUuid,
      selectedForm?.visitTypeUuid,
      selectedForm?.encounterUuid,
      selectedForm?.visitStartDatetime,
      selectedForm?.visitStopDatetime,
      currentVisit?.uuid,
      currentVisit?.visitType?.uuid,
      currentVisit?.startDatetime,
      currentVisit?.stopDatetime,
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

  // FIXME: This logic triggers a reload of the form when the formUuid changes. It's a workaround for the fact that the form doesn't reload when the formUuid changes.
  useEffect(() => {
    if (state.formUuid) {
      setShowForm(false);
      setTimeout(() => {
        setShowForm(true);
      });
    }
  }, [state]);

  return (
    <div>
      {showForm && selectedForm && patientUuid && patient && <ExtensionSlot name="form-widget-slot" state={state} />}
    </div>
  );
};

export default FormEntry;
