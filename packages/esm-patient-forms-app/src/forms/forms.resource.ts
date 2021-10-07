import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Encounter, Form } from '../types';

export function useForms() {
  const customRepresentation =
    'custom:(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))';

  const { data, error, isValidating } = useSWR<{ data: { results: Array<Form> } }, Error>(
    `/ws/rest/v1/form?v=${customRepresentation}`,
    openmrsFetch,
  );

  const formattedForms = data ? data.data.results.map(mapToFormObject) : null;

  return {
    data: formattedForms,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

export function useEncounters(patientUuid: string, startDate: Date, endDate: Date) {
  const customRepresentation =
    'custom:(uuid,encounterDatetime,encounterType:(uuid,name),form:(uuid,name,encounterType:(uuid,name),' +
    'version,published,retired,resources:(uuid,name,dataType,valueReference))';

  const { data, error, isValidating } = useSWR<{ data: { results: Array<Encounter> } }, Error>(
    `/ws/rest/v1/encounter?v=${customRepresentation}&patient=${patientUuid}&fromdate=${startDate.toISOString()}&todate=${endDate.toISOString()}`,
    openmrsFetch,
  );

  const formattedEncounters = data
    ? data.data.results
        .map(mapToEncounterObject)
        .filter((encounter) => encounter.form)
        .sort((a, b) => (b.encounterDateTime > a.encounterDateTime ? 1 : -1))
    : null;

  return {
    data: formattedEncounters,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

function mapToEncounterObject(openmrsRestEncounter: any): Encounter {
  return {
    uuid: openmrsRestEncounter.uuid,
    encounterDateTime: new Date(openmrsRestEncounter.encounterDatetime),
    encounterTypeUuid: openmrsRestEncounter.encounterType ? openmrsRestEncounter.encounterType.uuid : null,
    encounterTypeName: openmrsRestEncounter.encounterType ? openmrsRestEncounter.encounterType.name : null,
    form: openmrsRestEncounter.form ? mapToFormObject(openmrsRestEncounter.form) : null,
  };
}

function mapToFormObject(openmrsRestForm): Form {
  return {
    uuid: openmrsRestForm.uuid,
    name: openmrsRestForm.name || openmrsRestForm.display,
    published: openmrsRestForm.published,
    retired: openmrsRestForm.retired,
    encounterTypeUuid: openmrsRestForm.encounterType ? openmrsRestForm.encounterType.uuid : null,
    encounterTypeName: openmrsRestForm.encounterType ? openmrsRestForm.encounterType.name : null,
    lastCompleted: null,
  };
}
