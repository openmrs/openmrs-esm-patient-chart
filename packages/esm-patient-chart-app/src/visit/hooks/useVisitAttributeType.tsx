import { FetchResponse, openmrsFetch, showNotification } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';

interface VisitAttributeType {
  uuid: string;
  display: 'Insurance Type';
  name: 'Insurance Type';
  description: string | null;
  datatypeClassname:
    | 'org.openmrs.customdatatype.datatype.ConceptDatatype'
    | 'org.openmrs.customdatatype.datatype.FloatDatatype'
    | 'Boolean'
    | 'Long Free Text'
    | 'Free Text'
    | 'Date';
  datatypeConfig: string;
  preferredHandlerClassname: any;
  retired: boolean;
}

interface Concept {
  uuid: string;
  name: {
    display: string;
  };
  display: string;
  answers: Array<{
    display: string;
    uuid: string;
  }>;
}

const visitAttributeTypeCustomRepresentation =
  'custom:(uuid,display,name,description,datatypeClassname,datatypeConfig)';

export function useVisitAttributeType(uuid) {
  const { data, error } = useSWR<FetchResponse<VisitAttributeType>, Error>(
    `/ws/rest/v1/visitattributetype/${uuid}?v=${visitAttributeTypeCustomRepresentation}`,
    openmrsFetch,
  );

  if (error) {
    showNotification({
      title: error?.name,
      description: error?.message,
      kind: 'error',
    });
  }

  const results = useMemo(() => {
    return {
      isLoading: !data && !error,
      error: error,
      data: data?.data,
    };
  }, [data, error]);

  return results;
}

export function useConceptAnswersForVisitAttributeType(conceptUuid) {
  const { data, error } = useSWR<FetchResponse<Concept>, Error>(
    conceptUuid ? `/ws/rest/v1/concept/${conceptUuid}` : null,
    openmrsFetch,
  );

  if (error) {
    showNotification({
      title: error?.name,
      description: error?.message,
      kind: 'error',
    });
  }

  const results = useMemo(() => {
    return {
      isLoading: !data && !error,
      error: error,
      data: data?.data,
      answers: data?.data?.answers,
    };
  }, [data, error]);

  return results;
}
