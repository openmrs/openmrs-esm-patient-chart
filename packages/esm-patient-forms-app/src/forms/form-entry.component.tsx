import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';
import {
  ExtensionSlot,
  openmrsFetch,
  type FetchResponse,
  useConfig,
  Workspace2,
  type Workspace2DefinitionProps,
  type Encounter,
} from '@openmrs/esm-framework';
import {
  ClinicianPicker,
  EncounterDateTimePicker,
  type Form,
  type FormRendererProps,
  invalidateVisitAndEncounterData,
  type Provider,
  useEncounterProvider,
} from '@openmrs/esm-patient-common-lib';
import { type FormEntryConfigSchema } from '../config-schema';
import { toHtmlForm } from './form-entry.resources';
import { useForms } from '../hooks/use-forms';
import HtmlFormEntryWrapper from '../htmlformentry/html-form-entry-wrapper.component';

const encounterVisitRep =
  'custom:(encounterDatetime,encounterProviders:(provider:(uuid,display,person:(display))),visit:(uuid,startDatetime,stopDatetime,visitType:(uuid,name)))';

interface EncounterDetails {
  encounterDatetime?: string;
  encounterProviders?: Array<{ provider?: { uuid: string; display?: string; person?: { display?: string } } }>;
  visit: FormEntryProps['visitContext'];
}

export interface FormEntryProps {
  form: Form;
  encounterUuid?: string;
  patientUuid;
  patient;
  visitContext;
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
  const { data: encounterData, isLoading: isLoadingEncounterVisit } = useSWR<FetchResponse<EncounterDetails>, Error>(
    encounterUuid ? `/ws/rest/v1/encounter/${encounterUuid}?v=${encounterVisitRep}` : null,
    openmrsFetch,
  );
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
  const { mutate: globalMutate } = useSWRConfig();
  const { t } = useTranslation();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { mutateForms } = useForms(patientUuid, visitUuid);

  // `null` means "now": the server stamps new encounters. When editing, the existing datetime is kept unless changed.
  const initialEncounterDatetime = useMemo(
    () => (encounterData?.data?.encounterDatetime ? new Date(encounterData.data.encounterDatetime) : null),
    [encounterData?.data?.encounterDatetime],
  );
  const [encounterDatetime, setEncounterDatetime] = useState<Date | null>(initialEncounterDatetime);
  const [encounterDatetimeError, setEncounterDatetimeError] = useState<string | undefined>();
  useEffect(() => {
    setEncounterDatetime(initialEncounterDatetime);
  }, [initialEncounterDatetime]);

  const initialProvider = useMemo<Provider | null>(() => {
    const provider = encounterData?.data?.encounterProviders?.at(-1)?.provider; // the last provider is the current one
    return provider ? { uuid: provider.uuid, person: { display: provider.person?.display ?? provider.display } } : null;
  }, [encounterData?.data?.encounterProviders]);
  const { provider: clinician, setProvider: setClinician } = useEncounterProvider({ initialProvider });

  const state = useMemo(
    () => ({
      view: 'form',
      formUuid: formUuid ?? null,
      visitUuid: visitUuid ?? null,
      visitTypeUuid: visitTypeUuid ?? null,
      visitStartDatetime: visitStartDatetime ?? null,
      visitStopDatetime: visitStopDatetime ?? null,
      patientUuid: patientUuid ?? null,
      patient,
      encounterUuid: encounterUuid ?? '',
      visit: effectiveVisitContext ?? null,
      additionalProps: additionalProps ?? {},
      handlePostResponse,
      hideControls,
      hidePatientBanner,
      preFilledQuestions,
      // The form's own encounter datetime and provider questions are replaced by the pickers above the form,
      // which only show the options the user is allowed to use
      encounterDatetime,
      encounterProvider: clinician?.uuid ?? null,
      closeWorkspace: () => {
        return closeWorkspace();
      },
      closeWorkspaceWithSavedChanges: () => {
        // Invalidate visit history and encounter tables since form submission may create/update encounters
        invalidateVisitAndEncounterData(globalMutate, patientUuid);

        mutateForms?.();

        return closeWorkspace({ discardUnsavedChanges: true });
      },
      promptBeforeClosing: (func) => setHasUnsavedChanges(func()),
      setHasUnsavedChanges,
    }),
    [
      clinician?.uuid,
      closeWorkspace,
      encounterDatetime,
      encounterUuid,
      formUuid,
      globalMutate,
      handlePostResponse,
      hideControls,
      hidePatientBanner,
      mutateForms,
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
        {showFormAndLoadedData &&
          (isHtmlForm ? (
            <HtmlFormEntryWrapper
              src={htmlFormEntryUrl}
              closeWorkspaceWithSavedChanges={state.closeWorkspaceWithSavedChanges}
            />
          ) : (
            <>
              <EncounterDateTimePicker
                id="clinical-form"
                dateLabel={t('encounterDate', 'Encounter date')}
                timingLabel={t('thisFormIs', 'This form is')}
                allowNow={initialEncounterDatetime === null}
                visit={effectiveVisitContext}
                value={encounterDatetime}
                onChange={setEncounterDatetime}
                onValidityChange={setEncounterDatetimeError}
              />
              <ClinicianPicker id="clinical-form" value={clinician} onChange={setClinician} />
              <ExtensionSlot key={state.formUuid} name="form-widget-slot" state={state} />
            </>
          ))}
      </div>
    </Workspace2>
  );
};

export default FormEntry;
