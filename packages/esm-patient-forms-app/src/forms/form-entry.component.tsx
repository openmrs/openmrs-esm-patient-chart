import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';
import {
  ExtensionSlot,
  openmrsFetch,
  type FetchResponse,
  useConfig,
  useConnectivity,
  Workspace2,
  type Workspace2DefinitionProps,
  type Encounter,
} from '@openmrs/esm-framework';
import { type Form, type FormRendererProps, invalidateVisitAndEncounterData } from '@openmrs/esm-patient-common-lib';
import { type FormEntryConfigSchema } from '../config-schema';
import { toHtmlForm } from './form-entry.resources';
import { useForms } from '../hooks/use-forms';
import HtmlFormEntryWrapper from '../htmlformentry/html-form-entry-wrapper.component';

const encounterVisitRep = 'custom:(visit:(uuid,startDatetime,stopDatetime,visitType:(uuid,name)))';

export interface FormEntryProps {
  form: Form;
  encounterUuid?: string;
  patientUuid;
  patient;
  visitContext;
  mutateVisitContext;
  additionalProps?: Record<string, any>;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  handlePostResponse?: (encounter: Encounter) => void;
  hideControls?: boolean;
  hidePatientBanner?: boolean;
  preFilledQuestions?: Record<string, string>;
}

const FormEntry: React.FC<FormEntryProps> = ({
  form,
  encounterUuid,
  patientUuid,
  patient,
  visitContext,
  mutateVisitContext,
  closeWorkspace,
  handlePostResponse,
  hideControls,
  hidePatientBanner,
  preFilledQuestions,
  additionalProps,
}) => {
  const formUuid = form.uuid;
  const { htmlFormEntryForms } = useConfig<FormEntryConfigSchema>();

  // When editing an existing encounter, fetch the encounter's own visit
  // so we use the correct visit context instead of the active visit.
  const { data: encounterData, isLoading: isLoadingEncounterVisit } = useSWR<
    FetchResponse<{ visit: FormEntryProps['visitContext'] }>,
    Error
  >(encounterUuid ? `/ws/rest/v1/encounter/${encounterUuid}?v=${encounterVisitRep}` : null, openmrsFetch);
  const encounterVisit = encounterData?.data?.visit ?? null;

  // For new encounters, use the active visit context.
  // For edits, use the encounter's own visit once loaded (which may be null for visitless encounters).
  // While the encounter fetch is in flight, fall back to visitContext so hooks below don't see undefined.
  const effectiveVisitContext = encounterUuid
    ? isLoadingEncounterVisit
      ? visitContext
      : encounterVisit
    : visitContext;

  const visitStartDatetime = effectiveVisitContext?.startDatetime;
  const visitStopDatetime = effectiveVisitContext?.stopDatetime;
  const visitTypeUuid = effectiveVisitContext?.visitType?.uuid;
  const visitUuid = effectiveVisitContext?.uuid;
  const htmlForm = toHtmlForm(form, htmlFormEntryForms);
  const isHtmlForm = htmlForm != null;
  const isOnline = useConnectivity();
  const { mutate: globalMutate } = useSWRConfig();
  const { t } = useTranslation();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { mutateForms } = useForms(patientUuid, visitUuid);

  const state = useMemo(
    () => ({
      view: 'form',
      formUuid: formUuid ?? null,
      visitUuid: visitUuid ?? null,
      visitTypeUuid: visitTypeUuid ?? null,
      visitStartDatetime: visitStartDatetime ?? null,
      visitStopDatetime: visitStopDatetime ?? null,
      isOffline: !isOnline,
      patientUuid: patientUuid ?? null,
      patient,
      encounterUuid: encounterUuid ?? '',
      visit: effectiveVisitContext ?? null,
      additionalProps: additionalProps ?? {},
      handlePostResponse,
      hideControls,
      hidePatientBanner,
      preFilledQuestions,
      closeWorkspace: () => {
        return closeWorkspace();
      },
      closeWorkspaceWithSavedChanges: () => {
        // Update current visit data for critical components
        mutateVisitContext?.();

        // Also invalidate visit history and encounter tables since form submission may create/update encounters
        invalidateVisitAndEncounterData(globalMutate, patientUuid);

        mutateForms?.();

        return closeWorkspace({ discardUnsavedChanges: true });
      },
      promptBeforeClosing: (func) => setHasUnsavedChanges(func()),
      setHasUnsavedChanges,
    }),
    [
      closeWorkspace,
      encounterUuid,
      formUuid,
      globalMutate,
      handlePostResponse,
      hideControls,
      hidePatientBanner,
      isOnline,
      mutateForms,
      mutateVisitContext,
      patient,
      patientUuid,
      preFilledQuestions,
      setHasUnsavedChanges,
      visitStartDatetime,
      visitStopDatetime,
      visitTypeUuid,
      visitUuid,
      additionalProps,
      effectiveVisitContext,
    ],
  ) satisfies FormRendererProps;

  const htmlFormEntryUrl = useMemo(() => {
    if (!htmlForm) {
      return null;
    }
    const uiPage = encounterUuid ? htmlForm.formEditUiPage : htmlForm.formUiPage;
    const url = `${window.openmrsBase}/htmlformentryui/htmlform/${uiPage}.page?`;
    const searchParams = new URLSearchParams();
    searchParams.append('patientId', patientUuid);
    if (visitUuid) {
      searchParams.append('visitId', visitUuid);
    }
    if (encounterUuid) {
      searchParams.append('encounterId', encounterUuid);
    }
    if (htmlForm.formUiResource) {
      searchParams.append('definitionUiResource', htmlForm.formUiResource);
    } else {
      searchParams.append('formUuid', htmlForm.formUuid);
    }
    searchParams.append('returnUrl', 'post-message:close-workspace');
    return url + searchParams;
  }, [encounterUuid, htmlForm, patientUuid, visitUuid]);

  const showFormAndLoadedData = form && patientUuid && !isLoadingEncounterVisit;

  return (
    <Workspace2 title={form.display ?? t('clinicalForm', 'Clinical form')} hasUnsavedChanges={hasUnsavedChanges}>
      <div>
        <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
        {showFormAndLoadedData &&
          (isHtmlForm ? (
            <HtmlFormEntryWrapper
              src={htmlFormEntryUrl}
              closeWorkspaceWithSavedChanges={state.closeWorkspaceWithSavedChanges}
            />
          ) : (
            <ExtensionSlot key={state.formUuid} name="form-widget-slot" state={state} />
          ))}
      </div>
    </Workspace2>
  );
};

export default FormEntry;
