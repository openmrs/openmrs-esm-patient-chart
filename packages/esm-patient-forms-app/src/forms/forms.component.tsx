import React, { useState } from 'react';
import dayjs from 'dayjs';
import FormView from './form-view.component';
import styles from './forms.component.scss';
import EmptyFormView from './empty-form.component';
import first from 'lodash-es/first';
import { ContentSwitcher, Switch, DataTableSkeleton, InlineLoading } from 'carbon-components-react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { Encounter } from '../types';
import { useEncounters, useForms } from './forms.resource';
import { filterAvailableAndCompletedForms } from './forms-utils';

enum FormsToShow {
  recommended = 0,
  completed,
  all,
}

interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
}

const Forms: React.FC<FormsProps> = ({ patientUuid, patient, pageSize, pageUrl, urlLabel }) => {
  const { t } = useTranslation();
  const headerTitle = t('forms', 'Forms');

  const [contentSwitcherValue, setContentSwitcherValue] = useState<FormsToShow>(FormsToShow.all);

  const toDate = dayjs(new Date()).endOf('day');
  const fromDate = dayjs(new Date()).startOf('day').subtract(500, 'day');

  const { data: encounters, isLoading: isLoadingEncounters } = useEncounters(
    patientUuid,
    fromDate.toDate(),
    toDate.toDate(),
  );

  const { data: forms, isError: isErrorForms, isLoading: isLoadingForms, isValidating } = useForms();

  if (isLoadingForms || isLoadingEncounters) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (isErrorForms) {
    return <ErrorState headerTitle={t('forms', 'Forms')} error={isErrorForms} />;
  }

  if (forms?.length && encounters?.length) {
    const availableForms = filterAvailableAndCompletedForms(forms, encounters);

    const completedForms = availableForms.completed.map((encounters) => {
      encounters.form.complete = true;
      encounters.form.lastCompleted = encounters.encounterDateTime ? encounters.encounterDateTime : null;
      return encounters.form;
    });

    const filledForms = forms.map((form) => {
      completedForms.map((completeForm) => {
        if (completeForm.uuid === form.uuid) {
          form.complete = true;
          form.lastCompleted = completeForm.lastCompleted ? completeForm.lastCompleted : null;
        }
      });
      return form;
    });

    return (
      <div className={styles.formsWidgetContainer}>
        <div className={styles.formsHeaderContainer}>
          <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
          {isValidating ? (
            <span>
              <InlineLoading />
            </span>
          ) : null}
          <div className={styles.contextSwitcherContainer}>
            <ContentSwitcher
              className={styles.contextSwitcherWidth}
              onChange={(event) => setContentSwitcherValue(event.name as any)}
              selectedIndex={contentSwitcherValue}>
              <Switch name={FormsToShow.recommended} text="Recommended" />
              <Switch name={FormsToShow.completed} text="Completed" />
              <Switch name={FormsToShow.all} text="All" />
            </ContentSwitcher>
          </div>
        </div>
        <div style={{ width: '100%' }}>
          {contentSwitcherValue === FormsToShow.completed && (
            <FormView
              forms={completedForms}
              patientUuid={patientUuid}
              patient={patient}
              encounterUuid={first<Encounter>(encounters)?.uuid}
              pageSize={pageSize}
              pageUrl={pageUrl}
              urlLabel={urlLabel}
            />
          )}
          {contentSwitcherValue === FormsToShow.all && (
            <FormView
              forms={filledForms}
              patientUuid={patientUuid}
              patient={patient}
              encounterUuid={first<Encounter>(encounters)?.uuid}
              pageSize={pageSize}
              pageUrl={pageUrl}
              urlLabel={urlLabel}
            />
          )}
          {contentSwitcherValue === FormsToShow.recommended && (
            <EmptyFormView action={t('noRecommendedFormsAvailable', 'No recommended forms available at the moment')} />
          )}
        </div>
      </div>
    );
  }
  return <EmptyFormView action={t('noFormsAvailable', 'There are no forms to display for this patient')} />;
};

export default Forms;
