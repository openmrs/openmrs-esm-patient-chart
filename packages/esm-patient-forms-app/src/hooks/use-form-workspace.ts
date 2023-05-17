import { useConfig, userHasAccess, useSession, useVisit } from '@openmrs/esm-framework';
import { Form, EncounterWithFormRef, CompletedFormInfo, FormsSection } from '../types';
import { ConfigObject, FormsSectionConfig } from '../config-schema';
import { useEncounters, useFormEncounters } from './use-form-encounters';
import { isValidOfflineFormEncounter } from '../offline-forms/offline-form-helpers';

export function useForms(patientUuid: string, cachedOfflineFormsOnly = false) {
  const { formsSectionsConfig, useCurrentVisitDates, htmlFormEntryForms } = useConfig() as ConfigObject;
  const visits = useVisit(patientUuid);
  const session = useSession();
  const allFormsRes = useFormEncounters(cachedOfflineFormsOnly, patientUuid);
  const filteredForms = filterForms(allFormsRes.data, cachedOfflineFormsOnly, htmlFormEntryForms, session);
  let startDate: Date;
  let stopDate: Date;

  if (useCurrentVisitDates) {
    startDate = visits?.currentVisit
      ? new Date(visits.currentVisit.startDatetime) // Date visit
      : new Date();
    stopDate = visits?.currentVisit?.stopDatetime
      ? new Date(visits.currentVisit.stopDatetime) // Date visit
      : undefined;
  }

  const encountersRes = useEncounters(patientUuid, startDate, stopDate);

  const pastEncounters = encountersRes.data?.data?.results ?? [];
  const data = filteredForms ? mapToFormsSectionInfo(formsSectionsConfig, filteredForms, pastEncounters) : undefined;

  const mutateForms = () => {
    allFormsRes.mutate();
    encountersRes.mutate();
  };
  // Note:
  // `pastEncounters` is currently considered as optional (i.e. any errors are ignored) since it's only used for display
  // and doesn't change any functional flows. This makes offline mode much easier to implement since the past encounters
  // don't have to be cached regularly.
  // If this ever becomes a problem for online mode (i.e. if an error should be rendered there when past encounters
  // for determining filled out forms can't be loaded) this should ideally be conditionally controlled via a flag
  // such that the current offline behavior doesn't change.

  return {
    data,
    error: allFormsRes.error,
    isValidating: allFormsRes.isValidating || encountersRes.isValidating,
    allForms: allFormsRes.data,
    mutateForms,
  };
}

function filterForms(forms: Array<Form>, cachedOfflineFormsOnly: boolean, htmlFormEntryForms, session): Array<Form> {
  let formsToDisplay = cachedOfflineFormsOnly
    ? forms?.filter((formInfo) => isValidOfflineFormEncounter(formInfo, htmlFormEntryForms))
    : forms;

  if (session?.user) {
    formsToDisplay = formsToDisplay?.filter((formInfo) =>
      userHasAccess(formInfo?.encounterType?.editPrivilege?.display, session.user),
    );
  }
  return formsToDisplay;
}

function mapToFormsSectionInfo(
  formsSectionsConfig: Array<FormsSectionConfig>,
  allForms: Array<Form>,
  encounters: Array<EncounterWithFormRef>,
): Array<FormsSection> {
  if (formsSectionsConfig) {
    return formsSectionsConfig.map((formsSectionConfig) => {
      return {
        name: formsSectionConfig.name,
        labelCode: formsSectionConfig.labelCode,
        completedFromsInfo: mapToFormCompletedInfo(formsSectionConfig, allForms, encounters),
      };
    });
  } else {
    return [
      {
        name: 'Forms',
        labelCode: 'forms',
        completedFromsInfo: mapFormsToFormCompletedInfo(allForms, encounters),
      },
    ];
  }
}

function mapToFormCompletedInfo(
  formsSectionConfig: FormsSectionConfig,
  allForms: Array<Form>,
  encounters: Array<EncounterWithFormRef>,
): Array<CompletedFormInfo> {
  return formsSectionConfig.forms
    .map((formConfig) => {
      const form: Form = allForms.find((form) => {
        return formConfig.formUuid
          ? form.uuid === formConfig.formUuid
          : form.encounterType.uuid === formConfig.encounterTypeUuid;
      });
      if (form == undefined) {
        return null;
      }
      const associatedEncounters = getAssociatedEncounters(form.uuid, encounters);
      const lastCompleted = getLastCompletedDate(associatedEncounters);
      return {
        form,
        associatedEncounters,
        lastCompleted,
      };
    })
    .filter((c) => {
      return c;
    });
}

function mapFormsToFormCompletedInfo(
  allForms: Array<Form>,
  encounters: Array<EncounterWithFormRef>,
): Array<CompletedFormInfo> {
  return allForms.map((form) => {
    const associatedEncounters = getAssociatedEncounters(form.uuid, encounters);
    const lastCompleted = getLastCompletedDate(associatedEncounters);
    return {
      form,
      associatedEncounters,
      lastCompleted,
    };
  });
}

function getAssociatedEncounters(
  formUuid: string,
  encounters: Array<EncounterWithFormRef>,
): Array<EncounterWithFormRef> {
  return encounters
    .filter((encounter) => encounter.form?.uuid === formUuid)
    .sort((a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime());
}

function getLastCompletedDate(associatedEncounters: Array<EncounterWithFormRef>): Date {
  return associatedEncounters.length > 0 ? new Date(associatedEncounters?.[0].encounterDatetime) : undefined;
}
