import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import first from 'lodash-es/first';
import ContentSwitcher from 'carbon-components-react/es/components/ContentSwitcher';
import Switch from 'carbon-components-react/es/components/Switch';
import FormView from './form-view-see-all.component';
import styles from './forms.component.scss';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { toFormObject } from './forms.resource';
import { filterAvailableAndCompletedForms } from './forms-utils';
import { Form } from '../types';
import EmptyFormView from './empty-form.component';
import { getObjectFHIR } from './get-FHIR-object';
import { openmrsFetch } from '@openmrs/esm-framework';
import _ from 'lodash';

enum FormViewState {
  recommended = 0,
  completed,
  all,
}

const Forms = () => {
  const urlPathArray = window.location.pathname.split('/');
  const patientUuid = urlPathArray[urlPathArray.length - 2];
  const [patient, setPatient] = useState<fhir.Patient>();

  useEffect(() => {
    getObjectFHIR(patientUuid).then(setPatient);
  }, [patientUuid]);

  const { t } = useTranslation();
  const displayText = t('forms', 'Forms');
  const headerTitle = t('forms', 'Forms');
  const [forms, setForms] = useState<Array<Form>>([]);
  const [encounters, setEncounters] = useState<Array<Encounter_see_all>>([]);
  const [completedForms, setCompletedForms] = useState<Array<Form>>([]);
  const [selectedFormView, setSelectedFormView] = useState<FormViewState>(FormViewState.all);
  const [filledForms, setFilledForms] = useState<Array<Form>>([]);

  async function fetchAllForms() {
    const searchResult = await openmrsFetch(
      `/ws/rest/v1/form?v=custom:(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))`,
      {
        method: 'GET',
      },
    );
    return searchResult.data.results.map((form) => toFormObject(form));
  }

  useEffect(() => {
    fetchAllForms().then(setForms);
  }, []);

  interface Encounter_see_all {
    uuid: string;
    encounterDateTime: Date;
    encounterTypeUuid?: string;
    encounterTypeName?: string;
    form?: Form;
    form_id?: string;
  }

  function toEncounterObject(openmrsRestEncounter: any): Encounter_see_all {
    return {
      uuid: openmrsRestEncounter.uuid,
      encounterDateTime: new Date(openmrsRestEncounter.encounterDatetime),
      encounterTypeUuid: openmrsRestEncounter.encounterType ? openmrsRestEncounter.encounterType.uuid : null,
      encounterTypeName: openmrsRestEncounter.encounterType ? openmrsRestEncounter.encounterType.name : null,
      form: openmrsRestEncounter.form ? toFormObject(openmrsRestEncounter.form) : null,
      form_id: openmrsRestEncounter.form ? openmrsRestEncounter.form.uuid : null,
    };
  }

  async function fetchPatientEncounters(patientUuid: string, startDate: Date, endDate: Date) {
    const customRepresentation = `custom:(uuid,encounterDatetime,encounterType:(uuid,name),form:(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))`;
    const searchResult = await openmrsFetch(
      `/ws/rest/v1/encounter?v=${customRepresentation}&patient=${patientUuid}&fromdate=${startDate.toISOString()}&todate=${endDate.toISOString()}`,
      {
        method: 'GET',
      },
    );
    var result_transformed = searchResult.data.results.map((result) => toEncounterObject(result));
    _.map(result_transformed, function (row) {
      if (row.form_id != null) return row;
    });
    result_transformed = _.uniqBy(result_transformed, 'form_id');
    return _.orderBy(result_transformed, ['encounterDateTime'], ['desc']);
  }

  useEffect(() => {
    const fromDate = dayjs(new Date()).startOf('day').subtract(500, 'day');
    const toDate = dayjs(new Date()).endOf('day');
    fetchPatientEncounters(patientUuid, fromDate.toDate(), toDate.toDate()).then(setEncounters);
  }, [patientUuid]);

  useEffect(() => {
    const availableForms = filterAvailableAndCompletedForms(forms, encounters);
    const completedForms = availableForms.completed.map((encounters) => {
      encounters.form.complete = true;
      encounters.form.lastCompleted = encounters.encounterDateTime ? encounters.encounterDateTime : null;
      return encounters.form;
    });
    setCompletedForms(completedForms);
  }, [forms, encounters]);

  useEffect(() => {
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

  return (
    <>
      {filledForms.length > 0 ? (
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
                encounterUuid={first<Encounter_see_all>(encounters)?.uuid}
              />
            )}
            {selectedFormView === FormViewState.all && (
              <FormView
                forms={filledForms}
                patientUuid={patientUuid}
                patient={patient}
                encounterUuid={first<Encounter_see_all>(encounters)?.uuid}
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
        <EmptyState displayText={displayText} headerTitle={t('helpText', 'Contact system Admin to configure form')} />
      )}
    </>
  );
};

export default Forms;
