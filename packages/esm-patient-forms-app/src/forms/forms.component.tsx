import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/plugin/isToday';
import { ContentSwitcher, Switch, DataTableSkeleton, InlineLoading, Tag } from '@carbon/react';
import { CardHeader, ErrorState, PatientProgram, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { useConfig, useLayoutType, useSession, userHasAccess } from '@openmrs/esm-framework';
import { isValidOfflineFormEncounter } from '../offline-forms/offline-form-helpers';
import { useProgramConfig } from '../hooks/use-program-config';
import { useForms } from '../hooks/use-forms';
import { ConfigObject } from '../config-schema';
import ConfigurableForms from './configurable-forms.component';
import EmptyFormView from './empty-form.component';
import FormView from './form-view.component';
import styles from './forms.scss';

const enum FormsCategory {
  Recommended,
  Completed,
  All,
}

interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  isOffline: boolean;
  activePatientEnrollment?: Array<PatientProgram>;
}

const Forms: React.FC<FormsProps> = ({ patientUuid, patient, pageSize, pageUrl, urlLabel, isOffline }) => {
  const { t } = useTranslation();
  const { htmlFormEntryForms, showRecommendedFormsTab, showConfigurableForms } = useConfig() as ConfigObject;
  const headerTitle = t('forms', 'Forms');
  const isTablet = useLayoutType() === 'tablet';
  const [formsCategory, setFormsCategory] = useState(
    showRecommendedFormsTab ? FormsCategory.Recommended : FormsCategory.All,
  );
  const { isValidating, data, error } = useForms(patientUuid, undefined, undefined, isOffline);
  const session = useSession();
  let formsToDisplay = isOffline
    ? data?.filter((formInfo) => isValidOfflineFormEncounter(formInfo.form, htmlFormEntryForms))
    : data;
  formsToDisplay = formsToDisplay?.filter((formInfo) =>
    userHasAccess(formInfo?.form?.encounterType?.editPrivilege?.display, session?.user),
  );
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { programConfigs } = useProgramConfig(patientUuid, showRecommendedFormsTab);

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

  if (showConfigurableForms) {
    return (
      <ConfigurableForms
        formsToDisplay={formsToDisplay}
        headerTitle={headerTitle}
        isValidating={isValidating}
        patientUuid={patientUuid}
        patient={patient}
        pageSize={pageSize}
        pageUrl={pageUrl}
        urlLabel={urlLabel}
        error={error}
      />
    );
  }

  if (!formsToDisplay && !error) {
    return <DataTableSkeleton role="progressbar" rowCount={5} />;
  }

  if (error) {
    return <ErrorState headerTitle={t('forms', 'Forms')} error={error} />;
  }

  if (formsToDisplay.length === 0) {
    return <EmptyFormView content={t('noFormsAvailable', 'There are no forms to display for this patient')} />;
  }

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        {isValidating ? (
          <span>
            <InlineLoading />
          </span>
        ) : null}
        <div className={styles.contextSwitcherContainer}>
          <ContentSwitcher
            className={isTablet ? styles.tabletContentSwitcher : styles.desktopContentSwitcher}
            onChange={(event) => setFormsCategory(event.name as any)}
            selectedIndex={formsCategory}
          >
            <Switch name={FormsCategory.Recommended} text="Recommended" />
            <Switch name={FormsCategory.Completed} text="Completed" />
            <Switch name={FormsCategory.All} text="All" />
          </ContentSwitcher>
        </div>
      </CardHeader>
      <div style={{ width: '100%' }}>
        {formsCategory === FormsCategory.Completed && (
          <FormView
            forms={formsToDisplay.filter(
              ({ associatedEncounters, lastCompleted }) =>
                associatedEncounters.length > 0 && dayjs(lastCompleted).isToday(),
            )}
            patientUuid={patientUuid}
            patient={patient}
            pageSize={pageSize}
            pageUrl={pageUrl}
            urlLabel={urlLabel}
          />
        )}
        {formsCategory === FormsCategory.All && (
          <FormView
            forms={formsToDisplay}
            patientUuid={patientUuid}
            patient={patient}
            pageSize={pageSize}
            pageUrl={pageUrl}
            urlLabel={urlLabel}
          />
        )}

        {formsCategory === FormsCategory.Recommended && (
          <FormView
            forms={recommendedForms}
            patientUuid={patientUuid}
            patient={patient}
            pageSize={pageSize}
            pageUrl={pageUrl}
            urlLabel={urlLabel}
          />
        )}
      </div>
    </div>
  );
};

export default Forms;
