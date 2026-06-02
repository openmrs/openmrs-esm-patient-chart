import { openmrsFetch, type FetchResponse, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

const conceptRepresentation = 'custom:(uuid,display,datatype,answers)';

export interface ConceptReferenceResponse {
  [key: string]: {
    uuid: string;
    display: string;
    datatype: {
      name: string;
    };
    answers: Array<{
      uuid: string;
      display: string;
    }>;
  };
}

export function useConcepts(conceptUuids: Array<string>) {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<ConceptReferenceResponse>, Error>(
    conceptUuids && conceptUuids.length > 0
      ? [`${restBaseUrl}/conceptreferences?v=${conceptRepresentation}`, conceptUuids]
      : null,
    ([url, refs]) =>
      openmrsFetch<ConceptReferenceResponse>(url, {
        headers: { 'Content-Type': 'application/json' },
        body: { references: refs },
        method: 'POST',
      }),
  );

  const concepts = Object.values(data?.data ?? {}).map((value) => ({
    uuid: value.uuid,
    display: value.display,
    dataType: value.datatype.name,
    answers: value.answers,
  }));

  if (error) {
    showSnackbar({
      title: error.name,
      subtitle: error.message,
      kind: 'error',
    });
  }

  return { concepts, isLoading };
}
