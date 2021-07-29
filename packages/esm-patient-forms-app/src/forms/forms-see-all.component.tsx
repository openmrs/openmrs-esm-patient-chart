import React from 'react';
import dayjs from 'dayjs';
import first from 'lodash-es/first';
import ContentSwitcher from 'carbon-components-react/es/components/ContentSwitcher';
import Switch from 'carbon-components-react/es/components/Switch';
import FormView from './form-view-see-all.component';
import styles from './forms.component.scss';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { fetchAllForms, fetchPatientEncounters } from './forms.resource';
import { filterAvailableAndCompletedForms } from './forms-utils';
import { Encounter, Form } from '../types';
import EmptyFormView from './empty-form.component';
import { fhir } from '@openmrs/esm-framework';

enum FormViewState {
  recommended = 0,
  completed,
  all,
}

interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const Forms: React.FC<FormsProps> = ({ patientUuid, patient }) => {
  async function setPatient(uUid) {
    patient = (await fhir.read<fhir.Patient>({ type: 'Patient', patient: uUid })).data;
  }

  const query = new URLSearchParams(location.search);
  patientUuid = query.get('patientUuid');
  setPatient(patientUuid);
  const { t } = useTranslation();
  const displayText = t('forms', 'Forms');
  const headerTitle = t('forms', 'Forms');
  const [error, setError] = React.useState(null);
  const [forms, setForms] = React.useState<Array<Form>>([]);
  const [encounters, setEncounters] = React.useState<Array<Encounter>>([]);
  const [completedForms, setCompletedForms] = React.useState<Array<Form>>([]);
  const [selectedFormView, setSelectedFormView] = React.useState<FormViewState>(FormViewState.all);
  const [filledForms, setFilledForms] = React.useState<Array<Form>>([]);

  React.useEffect(() => {
    fetchAllForms().subscribe((forms) => setForms(forms), setError);
  }, []);

  React.useEffect(() => {
    const fromDate = dayjs(new Date()).startOf('day').subtract(500, 'day');
    const toDate = dayjs(new Date()).endOf('day');
    fetchPatientEncounters(patientUuid, fromDate.toDate(), toDate.toDate()).subscribe(
      (encounters) => setEncounters(encounters),
      setError,
    );
  }, [patientUuid]);

  React.useEffect(() => {
    const availableForms = filterAvailableAndCompletedForms(forms, encounters);
    const completedForms = availableForms.completed.map((encounters) => {
      encounters.form.complete = true;
      encounters.form.lastCompleted = encounters.encounterDateTime ? encounters.encounterDateTime : null;
      return encounters.form;
    });
    setCompletedForms(completedForms);
  }, [forms, encounters]);

  React.useEffect(() => {
    const filledForms = forms.map((form) => {
      completedForms.map((completeForm) => {
        if (completeForm.uuid === form.uuid) {
          form.complete = true;
          form.lastCompleted = completeForm.lastCompleted ? completeForm.lastCompleted : null;
        }
      });
      return form;
    });
    setFilledForms(filledForms);
  }, [forms, completedForms]);

  const RenderForm = () => {
    return (
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
            />
          )}
          {selectedFormView === FormViewState.all && (
            <FormView
              forms={filledForms}
              patientUuid={patientUuid}
              patient={patient}
              encounterUuid={first<Encounter>(encounters)?.uuid}
            />
          )}
          {selectedFormView === FormViewState.recommended && (
            <EmptyFormView action={t('noRecommendedFormsAvailable', 'No recommended forms available at the moment')} />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {filledForms.length > 0 ? (
        <RenderForm />
      ) : (
        <EmptyState displayText={displayText} headerTitle={t('helpText', 'Contact system Admin to configure form')} />
      )}
      {error && <ErrorState error={error} headerTitle={headerTitle} />}
    </>
  );
};

export default Forms;
