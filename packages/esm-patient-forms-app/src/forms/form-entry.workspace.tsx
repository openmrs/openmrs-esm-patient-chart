import React, { useEffect, useMemo, useState } from 'react';
import { ExtensionSlot, useConnectivity, usePatient } from '@openmrs/esm-framework';
import {
  type DefaultPatientWorkspaceProps,
  type FormEntryProps,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';

interface FormEntryComponentProps extends DefaultPatientWorkspaceProps {
  mutateForm: () => void;
  formInfo: FormEntryProps;
}

const FormEntry: React.FC<FormEntryComponentProps> = ({
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  mutateForm,
  formInfo,
}) => {
  const { encounterUuid, formUuid, visitStartDatetime, visitStopDatetime, visitTypeUuid, visitUuid, additionalProps } =
    formInfo || {};
  const { patient } = usePatient(patientUuid);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const [showForm, setShowForm] = useState(true);
  const isOnline = useConnectivity();
  const state = useMemo(
    () => ({
      view: 'form',
      formUuid: formUuid ?? null,
      visitUuid: visitUuid ?? currentVisit?.uuid ?? null,
      visitTypeUuid: visitTypeUuid ?? currentVisit?.visitType?.uuid ?? null,
      visitStartDatetime: visitStartDatetime ?? currentVisit?.startDatetime ?? null,
      visitStopDatetime: visitStopDatetime ?? currentVisit?.stopDatetime ?? null,
      isOffline: !isOnline,
      patientUuid: patientUuid ?? null,
      patient,
      encounterUuid: encounterUuid ?? null,
      closeWorkspace: () => {
        typeof mutateForm === 'function' && mutateForm();
        closeWorkspace();
      },
      closeWorkspaceWithSavedChanges: () => {
        typeof mutateForm === 'function' && mutateForm();
        closeWorkspaceWithSavedChanges();
      },
      promptBeforeClosing,
      additionalProps,
    }),
    [
      formUuid,
      visitUuid,
      visitTypeUuid,
      encounterUuid,
      visitStartDatetime,
      visitStopDatetime,
      currentVisit?.uuid,
      currentVisit?.visitType?.uuid,
      currentVisit?.startDatetime,
      currentVisit?.stopDatetime,
      patientUuid,
      patient,
      isOnline,
      mutateForm,
      closeWorkspace,
      closeWorkspaceWithSavedChanges,
      promptBeforeClosing,
      additionalProps,
    ],
  );

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
      {showForm && formInfo && patientUuid && patient && <ExtensionSlot name="form-widget-slot" state={state} />}
    </div>
  );
};

export default FormEntry;
