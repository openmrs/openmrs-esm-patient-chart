import { FetchResponse, openmrsFetch, showNotification } from '@openmrs/esm-framework';
import { useEffect, useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

interface VisitAttributeType {
  uuid: string;
  display: string;
  name: string;
  description: string | null;
  datatypeClassname:
    | 'org.openmrs.customdatatype.datatype.ConceptDatatype'
    | 'org.openmrs.customdatatype.datatype.FloatDatatype'
    | 'org.openmrs.customdatatype.datatype.BooleanDatatype'
    | 'org.openmrs.customdatatype.datatype.LongFreeTextDatatype'
    | 'org.openmrs.customdatatype.datatype.FreeTextDatatype'
    | 'org.openmrs.customdatatype.datatype.DateDatatype';
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
  const { data, error } = useSWRImmutable<FetchResponse<VisitAttributeType>, any>(
    `/ws/rest/v1/visitattributetype/${uuid}?v=${visitAttributeTypeCustomRepresentation}`,
    openmrsFetch,
  );

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
  const { data, error } = useSWRImmutable<FetchResponse<Concept>, any>(
    conceptUuid ? `/ws/rest/v1/concept/${conceptUuid}` : null,
    openmrsFetch,
  );

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
