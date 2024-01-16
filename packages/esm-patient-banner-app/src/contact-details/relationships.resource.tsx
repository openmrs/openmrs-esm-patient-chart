import { useMemo } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';

const customRepresentation =
  'custom:(display,uuid,personA:(uuid,age,display),personB:(uuid,age,display),relationshipType:(uuid,display,description,aIsToB,bIsToA))';

export function useRelationships(patientUuid: string) {
  const url = patientUuid ? `/ws/rest/v1/relationship?person=${patientUuid}&v=${customRepresentation}` : null;
  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<RelationshipsResponse>, Error>(
    url,
    openmrsFetch,
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
        name: extractName(r.personB.display),
        display: r.personB.display,
        relativeAge: r.personB.age,
        relativeUuid: r.personB.uuid,
        relationshipType: r.relationshipType.bIsToA,
      });
    } else {
      relationshipsData.push({
        uuid: r.uuid,
        name: extractName(r.personA.display),
        display: r.personA.display,
        relativeAge: r.personA.age,
        relativeUuid: r.personA.uuid,
        relationshipType: r.relationshipType.aIsToB,
      });
    }
  }
  return relationshipsData;
}

const extractName = (display: string) => {
  const pattern = /-\s*(.*)$/;
  const match = display.match(pattern);
  if (match && match.length > 1) {
    return match[1].trim();
  }
  return display.trim();
};

interface RelationshipsResponse {
  results: Array<Relationship>;
}

interface ExtractedRelationship {
  uuid: string;
  name: string;
  display: string;
  relativeAge: number;
  relativeUuid: string;
  relationshipType: string;
}

export interface Relationship {
  display: string;
  uuid: string;
  personA: Person;
  personB: Person;
  relationshipType: {
    uuid: string;
    display: string;
    aIsToB: string;
    bIsToA: string;
  };
}

interface Person {
  uuid: string;
  age: number;
  display: string;
}
