import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/plugin/isToday';
import { ContentSwitcher, Switch, DataTableSkeleton, InlineLoading } from '@carbon/react';
import { CardHeader, ErrorState, PatientProgram, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useProgramConfig } from '../hooks/use-program-config';
import { useForms } from '../hooks/use-forms';
import { ConfigObject } from '../config-schema';
import ConfigurableForms from './configurable-forms.component';
import EmptyFormView from './empty-form.component';
import FormView from './form-view.component';
import styles from './forms.scss';

type FormsCategory = 'All' | 'Completed' | 'Recommended';

enum ContentSwitcherIndices {
  All = 0,
  Recommended = 1,
  Completed = 2,
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
  const { showRecommendedFormsTab, showConfigurableForms } = useConfig() as ConfigObject;
  const headerTitle = t('forms', 'Forms');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const [formsCategory, setFormsCategory] = useState<FormsCategory>(showRecommendedFormsTab ? 'Recommended' : 'All');
  const {
    isValidating,
    data: formsToDisplay,
    error,
    mutateForms,
  } = useForms(patientUuid, undefined, undefined, isOffline);

  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { programConfigs } = useProgramConfig(patientUuid, showRecommendedFormsTab);

  const completedForms = useMemo(
    () =>
      formsToDisplay?.filter(
        ({ associatedEncounters, lastCompleted }) => associatedEncounters.length > 0 && dayjs(lastCompleted).isToday(),
      ),
    [formsToDisplay],
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
    return <DataTableSkeleton role="progressbar" rowCount={5} compact={isDesktop} zebra />;
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
            onChange={({ name }: { name: FormsCategory }) => setFormsCategory(name)}
            selectedIndex={ContentSwitcherIndices[formsCategory]}
            size={isTablet ? 'md' : 'sm'}
          >
            <Switch name={'All'} text={t('all', 'All')} />
            <Switch name={'Recommended'} text={t('recommended', 'Recommended')} />
            <Switch name={'Completed'} text={t('completed', 'Completed')} />
          </ContentSwitcher>
        </div>
      </CardHeader>
      <div style={{ width: '100%' }}>
        {formsCategory === 'Completed' && (
          <FormView
            category={'Completed'}
            forms={completedForms}
            patientUuid={patientUuid}
            patient={patient}
            pageSize={pageSize}
            pageUrl={pageUrl}
            urlLabel={urlLabel}
            mutateForms={mutateForms}
          />
        )}
        {formsCategory === 'Recommended' && (
          <FormView
            category={'Recommended'}
            forms={recommendedForms}
            patientUuid={patientUuid}
            patient={patient}
            pageSize={pageSize}
            pageUrl={pageUrl}
            urlLabel={urlLabel}
            mutateForms={mutateForms}
          />
        )}
        {formsCategory === 'All' && (
          <FormView
            forms={formsToDisplay}
            patientUuid={patientUuid}
            patient={patient}
            pageSize={pageSize}
            pageUrl={pageUrl}
            urlLabel={urlLabel}
            mutateForms={mutateForms}
          />
        )}
      </div>
    </div>
  );
};

export default Forms;
