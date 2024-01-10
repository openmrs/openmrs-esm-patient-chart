import { openmrsFetch } from '@openmrs/esm-framework';
import { type ImmunizationWidgetConfigObject, type OpenmrsConcept } from '../types/fhir-immunization-domain';
import useSWR from 'swr';

export function useImmunizationsConceptSet(config: ImmunizationWidgetConfigObject) {
  const conceptRepresentation =
    'custom:(uuid,display,answers:(uuid,display),conceptMappings:(conceptReferenceTerm:(conceptSource:(name),code)))';

  const { data, error, isLoading } = useSWR<{ data: { results: Array<OpenmrsConcept> } }, Error>(
    `/ws/rest/v1/concept?references=${config.immunizationConceptSet}&v=${conceptRepresentation}`,
    openmrsFetch,
  );
  return {
    immunizationsConceptSet: data && data.data.results[0],
    isLoading,
  };
}
