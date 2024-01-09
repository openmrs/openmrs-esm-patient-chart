import { openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type ImmunizationWidgetConfigObject, type OpenmrsConcept } from '../types/fhir-immunization-domain';

export function useImmunizationsConceptSet(config: ImmunizationWidgetConfigObject) {
  const conceptRepresentation =
    'custom:(uuid,display,answers:(uuid,display),conceptMappings:(conceptReferenceTerm:(conceptSource:(name),code)))';

  const { data, error, isLoading } = useSWRImmutable<{ data: { results: Array<OpenmrsConcept> } }, Error>(
    `/ws/rest/v1/concept?references=${config.vaccinesConceptSet}&v=${conceptRepresentation}`,
    openmrsFetch,
  );
  return {
    immunizationsConceptSet: data && data.data.results[0],
    isLoading,
  };
}
