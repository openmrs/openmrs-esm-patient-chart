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

  forms.forEach((form) => {
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
