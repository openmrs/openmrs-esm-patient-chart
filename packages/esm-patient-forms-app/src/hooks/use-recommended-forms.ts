import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useForms } from './use-forms';
import { ConfigObject } from '../config-schema';
import { useProgramConfig } from './use-program-config';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { isValidOfflineFormEncounter } from '../offline-forms/offline-form-helpers';
import { useConfig, userHasAccess, useSession } from '@openmrs/esm-framework';

export const useRecommendForms = (patientUuid: string, isOffline: boolean) => {
  const { htmlFormEntryForms, showRecommendedFormsTab } = useConfig() as ConfigObject;
  const { programConfigs } = useProgramConfig(patientUuid, showRecommendedFormsTab);
  const { data, error } = useForms(patientUuid, undefined, undefined, isOffline);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const session = useSession();
  let formsToDisplay = isOffline
    ? data?.filter((formInfo) => isValidOfflineFormEncounter(formInfo.form, htmlFormEntryForms))
    : data;
  formsToDisplay = formsToDisplay?.filter((formInfo) =>
    userHasAccess(formInfo?.form?.encounterType?.editPrivilege?.display, session?.user),
  );
  const recommendedForms = useMemo(
    () =>
      formsToDisplay
        ?.filter(({ form }) =>
          Object.values(programConfigs)
            .flatMap((programConfig) => programConfig.visitTypes)
            ?.find((visitType) => visitType.uuid === currentVisit?.visitType.uuid)
            ?.encounterTypes.some(({ uuid }) => uuid === form.encounterType.uuid),
        )
        .filter(({ lastCompleted }) => (lastCompleted === undefined ? true : !dayjs(lastCompleted).isToday())),
    [currentVisit?.visitType.uuid, formsToDisplay, programConfigs],
  );

  return { recommendedForms, formsToDisplay, error };
};
