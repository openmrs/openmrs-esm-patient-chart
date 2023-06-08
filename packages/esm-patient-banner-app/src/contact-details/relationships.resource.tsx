import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';

const customRepresentation =
  'custom:(display,uuid,personA,personB,relationshipType:(uuid,display,description,aIsToB,bIsToA))';

export function useRelationships(patientUuid: string) {
  const url = patientUuid ? `/ws/rest/v1/relationship?person=${patientUuid}&v=${customRepresentation}` : null;
  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<RelationshipsResponse>, Error>(
    url,
    openmrsFetch,
  );

  // eslint-disable-next-line no-console
  console.log(data);

  // eslint-disable-next-line no-console
  console.log(
    data?.data?.results?.map((r) => r.personA.person?.display),
    'data Data',
  );

  const formattedRelationships = useMemo(() => {
    return data?.data?.results?.length ? extractRelationshipData(patientUuid, data.data.results) : null;
  }, [data?.data?.results, patientUuid]);

  return {
    data: formattedRelationships,
    isError: error,
    isLoading,
    isValidating,
  };
}

function extractRelationshipData(
  patientIdentifier: string,
  relationships: Array<Relationship>,
): Array<ExtractedRelationship> {
  const relationshipsData = [];
  for (const r of relationships) {
    if (patientIdentifier === r.personA.uuid) {
      relationshipsData.push({
        uuid: r.uuid,
        display: r.personB.person?.display,
        relativeAge: r.personB.person?.age,
        relativeUuid: r.personB.uuid,
        relationshipType: r.relationshipType.bIsToA,
      });
    } else {
      relationshipsData.push({
        uuid: r.uuid,
        display: r.personA.person?.display,
        relativeAge: r.personA.person?.age,
        relativeUuid: r.personA.uuid,
        relationshipType: r.relationshipType.aIsToB,
      });
    }
  }
  return relationshipsData;
}

interface RelationshipsResponse {
  results: Array<Relationship>;
}

interface ExtractedRelationship {
  uuid: string;
  display: string;
  relativeAge: number;
  relativeUuid: string;
  relationshipType: string;
}

export interface Relationship {
  display: string;
  uuid: string;
  personA: PersonX;
  personB: PersonX;
  relationshipType: {
    uuid: string;
    display: string;
    aIsToB: string;
    bIsToA: string;
  };
}

interface PersonX {
  uuid: string;
  person: {
    age: number;
    uuid: string;
    display: string;
  };
}
