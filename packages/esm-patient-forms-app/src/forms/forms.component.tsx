import React, { useState } from 'react';
import FormView from './form-view.component';
import styles from './forms.component.scss';
import EmptyFormView from './empty-form.component';
import first from 'lodash-es/first';
import { ContentSwitcher, Switch, DataTableSkeleton } from 'carbon-components-react';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useForms } from '../hooks/useForms';
import { Encounter } from '../types';

enum FormViewState {
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
  const [selectedFormView, setSelectedFormView] = useState<FormViewState>(FormViewState.all);
  const { filledForms, completedForms, encounters, loading, error, forms } = useForms(patientUuid);

  return (
    <>
      {loading === true && error.length === 0 && <DataTableSkeleton rowCount={5} />}
      {loading === false && error.length === 0 && (
        <>
          {forms.length > 0 ? (
            <div className={styles.formsWidgetContainer}>
              <div className={styles.formsHeaderContainer}>
                <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
                <div className={styles.contextSwitcherContainer}>
                  <ContentSwitcher
                    className={styles.contextSwitcherWidth}
                    onChange={(event) => setSelectedFormView(event.name as any)}
                    selectedIndex={selectedFormView}>
                    <Switch name={FormViewState.recommended} text="Recommended" />
                    <Switch name={FormViewState.completed} text="Completed" />
                    <Switch name={FormViewState.all} text="All" />
                  </ContentSwitcher>
                </div>
              </div>
              <div style={{ width: '100%' }}>
                {selectedFormView === FormViewState.completed && (
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
                {selectedFormView === FormViewState.all && (
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
                {selectedFormView === FormViewState.recommended && (
                  <EmptyFormView
                    action={t('noRecommendedFormsAvailable', 'No recommended forms available at the moment')}
                  />
                )}
              </div>
            </div>
          ) : (
            <EmptyFormView action={t('noFormsAvailable', 'There are no Forms to display for this patient')} />
          )}
        </>
      )}
      {error.length > 0 && <ErrorState headerTitle={t('errorHeader', 'Forms Error')} error={error[0]} />}
    </>
  );
};

export default Forms;
