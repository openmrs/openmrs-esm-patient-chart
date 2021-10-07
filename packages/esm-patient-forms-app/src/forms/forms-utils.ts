import dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';
import { Encounter, Form } from '../types';

export function filterAvailableAndCompletedForms(
  forms: Array<Form>,
  encounters: Array<Encounter>,
): {
  available: Array<Form>;
  completed: Array<Encounter>;
} {
  const availability = {
    available: [],
    completed: [],
  };

  if (!forms && !encounters) {
    return availability;
  }

  forms?.forEach((form) => {
    const completedEncounters = encounters.filter((encounter) => {
      return areFormsEqual(encounter.form, form);
    });
    if (completedEncounters.length > 0) {
      availability.completed.push(...completedEncounters);
    } else {
      availability.available.push(form);
    }
  });
  return availability;
}

export function areFormsEqual(a: Form, b: Form): boolean {
  return a !== null && b !== null && a.uuid === b.uuid;
}

export const formatDate = (strDate: string | Date) => {
  const date = dayjs(strDate);
  const today = dayjs(new Date());
  if (date.date() === today.date() && date.month() === today.month() && date.year() === today.year()) {
    return `Today @ ${date.format('HH:mm')}`;
  }
  return date.format('DD - MMM - YYYY @ HH:mm');
};

export const sortFormLatestFirst = (formA: Form, formB: Form) =>
  new Date(formB.lastCompleted).getTime() - new Date(formA.lastCompleted).getTime();

// This is a work around until attach function is re-worked to enable passing of props
export interface FormEntryProps {
  encounterUuid?: string;
  visitUuid?: string;
  formUuid: string;
  patient: fhir.Patient;
}

export const formEntrySub = new BehaviorSubject<FormEntryProps | null>(null);
