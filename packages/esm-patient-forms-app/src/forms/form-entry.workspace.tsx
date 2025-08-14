import React, { useEffect, useMemo, useState } from 'react';
import { useSWRConfig } from 'swr';
import { ExtensionSlot, useConnectivity } from '@openmrs/esm-framework';
import {
  clinicalFormsWorkspace,
  invalidateVisitAndEncounterData,
  type DefaultPatientWorkspaceProps,
  type FormEntryProps,
} from '@openmrs/esm-patient-common-lib';

interface FormEntryComponentProps extends DefaultPatientWorkspaceProps {
  mutateForm: () => void;
  formInfo: FormEntryProps;
  clinicalFormsWorkspaceName?: string;
}

const FormEntry: React.FC<FormEntryComponentProps> = ({
  patientUuid,
  patient,
  clinicalFormsWorkspaceName = clinicalFormsWorkspace,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  mutateForm,
  formInfo,
  visitContext,
  mutateVisitContext,
}) => {
  const { encounterUuid, formUuid, visitStartDatetime, visitStopDatetime, visitTypeUuid, visitUuid, additionalProps } =
    formInfo || {};
  const [showForm, setShowForm] = useState(true);
  const isOnline = useConnectivity();
  const { mutate: globalMutate } = useSWRConfig();

  const state = useMemo(
    () => ({
      view: 'form',
      formUuid: formUuid ?? null,
      visitUuid: visitUuid ?? visitContext?.uuid ?? null,
      visitTypeUuid: visitTypeUuid ?? visitContext?.visitType?.uuid ?? null,
      visitStartDatetime: visitStartDatetime ?? visitContext?.startDatetime ?? null,
      visitStopDatetime: visitStopDatetime ?? visitContext?.stopDatetime ?? null,
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
        // Update current visit data for critical components
        mutateVisitContext?.();

        // Also invalidate visit history and encounter tables since form submission may create/update encounters
        invalidateVisitAndEncounterData(globalMutate, patientUuid);

        closeWorkspaceWithSavedChanges();
      },
      promptBeforeClosing,
      additionalProps,
      clinicalFormsWorkspaceName,
    }),
    [
      additionalProps,
      clinicalFormsWorkspaceName,
      closeWorkspace,
      closeWorkspaceWithSavedChanges,
      visitContext?.startDatetime,
      visitContext?.stopDatetime,
      visitContext?.uuid,
      visitContext?.visitType?.uuid,
      encounterUuid,
      formUuid,
      globalMutate,
      isOnline,
      mutateVisitContext,
      mutateForm,
      patient,
      patientUuid,
      promptBeforeClosing,
      visitStartDatetime,
      visitStopDatetime,
      visitTypeUuid,
      visitUuid,
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
      <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
      {showForm && formInfo && patientUuid && patient && <ExtensionSlot name="form-widget-slot" state={state} />}
    </div>
  );
};

export default FormEntry;
