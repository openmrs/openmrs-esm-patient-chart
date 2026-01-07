import React, { useMemo, useState } from 'react';
import { useSWRConfig } from 'swr';
import {
  ExtensionSlot,
  useConfig,
  useConnectivity,
  Workspace2,
  type Workspace2DefinitionProps,
  type Encounter,
} from '@openmrs/esm-framework';
import { type Form, type FormRendererProps, invalidateVisitAndEncounterData } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { type FormEntryConfigSchema } from '../config-schema';
import { toHtmlForm } from './form-entry.resources';
import HtmlFormEntryWrapper from '../htmlformentry/html-form-entry-wrapper.component';

export interface FormEntryProps {
  form: Form;
  encounterUuid: string;
  patientUuid;
  patient;
  visitContext;
  mutateVisitContext;
  additionalProps?: Record<string, any>;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  handlePostResponse?: (encounter: Encounter) => void;
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
  additionalProps,
}) => {
  const formUuid = form.uuid;
  const visitStartDatetime = visitContext?.startDatetime;
  const visitStopDatetime = visitContext?.stopDatetime;
  const visitTypeUuid = visitContext?.visitType.uuid;
  const visitUuid = visitContext?.uuid;
  const { htmlFormEntryForms } = useConfig<FormEntryConfigSchema>();
  const htmlForm = toHtmlForm(form, htmlFormEntryForms);
  const isHtmlForm = htmlForm != null;
  const isOnline = useConnectivity();
  const { mutate: globalMutate } = useSWRConfig();
  const { t } = useTranslation();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      encounterUuid: encounterUuid ?? '',
      visit: visitContext ?? null,
      additionalProps: additionalProps ?? {},
      handlePostResponse,
      closeWorkspace: () => {
        return closeWorkspace();
      },
      closeWorkspaceWithSavedChanges: () => {
        // Update current visit data for critical components
        mutateVisitContext?.();

        // Also invalidate visit history and encounter tables since form submission may create/update encounters
        invalidateVisitAndEncounterData(globalMutate, patientUuid);

        return closeWorkspace({ discardUnsavedChanges: true, closeWindow: true });
      },
      promptBeforeClosing: (func) => setHasUnsavedChanges(func()),
    }),
    [
      closeWorkspace,
      encounterUuid,
      formUuid,
      globalMutate,
      handlePostResponse,
      isOnline,
      mutateVisitContext,
      patient,
      patientUuid,
      setHasUnsavedChanges,
      visitStartDatetime,
      visitStopDatetime,
      visitTypeUuid,
      visitUuid,
      additionalProps,
      visitContext,
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

  const showFormAndLoadedData = form && patientUuid;

  return (
    <Workspace2 title={form.display ?? t('clinicalForm', 'Clinical form')} hasUnsavedChanges={hasUnsavedChanges}>
      <div>
        <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
        {showFormAndLoadedData &&
          (isHtmlForm ? (
            <HtmlFormEntryWrapper
              src={htmlFormEntryUrl}
              closeWorkspaceWithSavedChanges={() => closeWorkspace({ discardUnsavedChanges: true })}
            />
          ) : (
            <ExtensionSlot key={state.formUuid} name="form-widget-slot" state={state} />
          ))}
      </div>
    </Workspace2>
  );
};

export default FormEntry;
