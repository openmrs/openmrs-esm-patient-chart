import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '@carbon/react';
import {
  type PatientWorkspace2DefinitionProps,
  invalidateCurrentVisit,
  invalidateVisitAndEncounterData,
  EmptyState,
} from '@openmrs/esm-patient-common-lib';
import {
  ExtensionSlot,
  showSnackbar,
  Workspace2,
  useConnectivity,
  useConfig,
} from '@openmrs/esm-framework';
import { useSWRConfig } from 'swr';
import { markPatientDeceased, useFormByName } from '../data.resource';

const MarkPatientDeceasedForm: React.FC<PatientWorkspace2DefinitionProps<{}, {}>> = ({
  closeWorkspace,
  groupProps: { patientUuid, patient, visitContext },
}) => {
  const { t } = useTranslation();
  const { mutate: globalMutate } = useSWRConfig();
  const isOnline = useConnectivity();
  const { deathDateConceptUuid, causeOfDeathConceptUuid } = useConfig();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { form, isLoading: isLoadingForm, error: formError } = useFormByName('Death Note');

  const state = useMemo(
    () => ({
      view: 'form',
      formUuid: form?.uuid,
      patientUuid: patientUuid ?? null,
      patient,
      visitUuid: visitContext?.uuid ?? null,
      visitTypeUuid: visitContext?.visitType?.uuid ?? null,
      visitStartDatetime: visitContext?.startDatetime ?? null,
      visitStopDatetime: visitContext?.stopDatetime ?? null,
      isOffline: !isOnline,
      encounterUuid: '',
      additionalProps: {
        mode: 'enter',
      },
      handlePostResponse: (encounter) => {
        // Extract Pronounced death date and time
        const deathDateObs = encounter.obs.find((obs) => obs.concept.uuid === deathDateConceptUuid);
        const deathDate = deathDateObs ? new Date(deathDateObs.value) : new Date();

        // Extract Primary cause of death (textarea)
        const causeObs = encounter.obs.find((obs) => obs.concept.uuid === causeOfDeathConceptUuid);
        const nonCodedCause = typeof causeObs?.value === 'string' ? causeObs.value : null;

        // Mark the patient as deceased in the person record
        return markPatientDeceased(deathDate, patientUuid, undefined, nonCodedCause).then(() => {
          globalMutate((key) => Array.isArray(key) && key[0] === 'patient' && key[1] === patientUuid);
          invalidateCurrentVisit(globalMutate, patientUuid);
          invalidateVisitAndEncounterData(globalMutate, patientUuid);

          showSnackbar({
            title: t('markDeceasedSuccessfully', 'Patient marked deceased successfully'),
          });
        });
      },
      closeWorkspace: () => {
        return closeWorkspace();
      },
      closeWorkspaceWithSavedChanges: () => {
        // Invalidate visit history and encounter tables
        invalidateVisitAndEncounterData(globalMutate, patientUuid);

        return closeWorkspace({ discardUnsavedChanges: true });
      },
      promptBeforeClosing: (func) => setHasUnsavedChanges(func()),
      setHasUnsavedChanges,
    }),
    [
      closeWorkspace,
      form?.uuid,
      globalMutate,
      isOnline,
      patient,
      patientUuid,
      t,
      visitContext,
      deathDateConceptUuid,
      causeOfDeathConceptUuid,
    ],
  );

  return (
    <Workspace2 title={t('markPatientDeceased', 'Mark patient deceased')} hasUnsavedChanges={hasUnsavedChanges}>
      {isLoadingForm ? (
        <Loading />
      ) : form ? (
        <div>
          <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
          <ExtensionSlot key={state.formUuid} name="form-widget-slot" state={state} />
        </div>
      ) : (
        <EmptyState
          displayText={t('deathNoteFormNotFound', 'The "Death Note" form could not be found. Please ensure it is configured in the system.')}
          headerTitle={t('formNotFound', 'Form Not Found')}
        />
      )}
    </Workspace2>
  );
};

export default MarkPatientDeceasedForm;
