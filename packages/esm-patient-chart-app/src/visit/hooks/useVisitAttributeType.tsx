import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
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

export function useVisitAttributeTypes() {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<VisitAttributeType[]>, Error>(
    `/ws/rest/v1/visitattributetype?v=${visitAttributeTypeCustomRepresentation}`,
    openmrsFetch,
  );

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const results = useMemo(() => {
    return {
      isLoading,
      error: error,
      data: data?.data,
    };
  }, [data, error, isLoading]);

  return results;
}

export function useVisitAttributeType(uuid) {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<VisitAttributeType>, Error>(
    `/ws/rest/v1/visitattributetype/${uuid}?v=${visitAttributeTypeCustomRepresentation}`,
    openmrsFetch,
  );

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const results = useMemo(() => {
    return {
      isLoading,
      error: error,
      data: data?.data,
    };
  }, [data, error, isLoading]);

  return results;
}

export function useConceptAnswersForVisitAttributeType(conceptUuid) {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<Concept>, Error>(
    conceptUuid ? `/ws/rest/v1/concept/${conceptUuid}` : null,
    openmrsFetch,
  );

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const results = useMemo(() => {
    return {
      isLoading,
      error: error,
      data: data?.data,
      answers: data?.data?.answers,
    };
  }, [data, error, isLoading]);

  return results;
}
