import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { filterAvailableAndCompletedForms } from '../forms/forms-utils';
import { fetchAllForms, fetchPatientEncounters } from '../forms/forms.resource';
import { Encounter, Form } from '../types';

export const useForms = (patientUuid: string) => {
  const [forms, setForms] = useState<Array<Form>>([]);
  const [encounters, setEncounters] = useState<Array<Encounter>>([]);
  const [completedForms, setCompletedForms] = useState<Array<Form>>([]);
  const [filledForms, setFilledForms] = useState<Array<Form>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Array<Error>>([]);

  useEffect(() => {
    fetchAllForms().subscribe(
      (forms) => setForms(forms),
      (error) => setError((prevState) => [...prevState, error]),
    );
  }, []);

  useEffect(() => {
    const fromDate = dayjs(new Date()).startOf('day').subtract(500, 'day');
    const toDate = dayjs(new Date()).endOf('day');
    fetchPatientEncounters(patientUuid, fromDate.toDate(), toDate.toDate()).subscribe(
      (encounters) => setEncounters(encounters),
      (error) => setError((prevState) => [...prevState, error]),
    );
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
    if (forms.length) {
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
      setLoading(false);
    }
  }, [forms, completedForms]);

  return { forms, filledForms, completedForms, encounters, loading, error };
};
