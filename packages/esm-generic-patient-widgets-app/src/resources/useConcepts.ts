import { openmrsFetch, type FetchResponse, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import chunk from 'lodash/chunk';
import useSWRImmutable from 'swr/immutable';

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
  const { data, error, isLoading } = useSWRImmutable<Array<FetchResponse<ConceptReferenceResponse>>, Error>(
    conceptUuids && conceptUuids.length > 0 ? getConceptReferenceUrls(conceptUuids) : null,
    (key: Array<string>) => Promise.all(key.map((url) => openmrsFetch<ConceptReferenceResponse>(url))),
  );

  const res: ConceptReferenceResponse = data?.reduce((acc, response) => ({ ...acc, ...response.data }), {});
  const concepts = res
    ? Object.values(res).map((value) => ({
        uuid: value.uuid,
        display: value.display,
        dataType: value.datatype.name,
        answers: value.answers,
      }))
    : [];

  if (error) {
    showSnackbar({
      title: error.name,
      subtitle: error.message,
      kind: 'error',
    });
  }

  return { concepts, isLoading };
}

function getConceptReferenceUrls(conceptUuids: Array<string>) {
  return chunk(conceptUuids, 10).map(
    (partition) =>
      `${restBaseUrl}/conceptreferences?references=${partition.join(',')}&v=custom:(uuid,display,datatype,answers)`,
  );
}
