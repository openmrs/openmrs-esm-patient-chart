import { useCallback, useEffect, useMemo } from 'react';
import { FetchResponse, openmrsFetch, usePatient } from '@openmrs/esm-framework';
import useSWRInfinite from 'swr/infinite';
import { exist, assessValue, extractMetaInformation, getConceptUuid } from './helper';
import { Concept, ConceptMeta, FHIRObservationResource, FhirResponse, ObsRecord } from './types';

export function useObservations() {
  const { patientUuid } = usePatient();
  const getUrl = useCallback(
    (pageIndex: number, prevPageData: FetchResponse<FhirResponse<FHIRObservationResource>>) => {
      if (prevPageData && !prevPageData?.data?.link.some(({ relation }) => relation === 'next')) {
        return null;
      }
      let url = '/ws/fhir2/R4/Observation';
      url += '?category=laboratory';
      url += `&patient=${patientUuid}`;
      url += '&_sort=-_date';
      url += `&_count=100`;
      if (pageIndex) {
        url += `&_getpagesoffset=${pageIndex * 10}`;
      }
      return url;
    },
    [patientUuid],
  );
  const { data, error, size, setSize } = useSWRInfinite<FetchResponse<FhirResponse<FHIRObservationResource>>, Error>(
    getUrl,
    openmrsFetch,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    // Infinitely fetching all the data
    if (data && data?.length === size && data?.[data.length - 1]?.data?.link?.some((x) => x.relation === 'next')) {
      setSize(size + 1);
    }
  }, [size, setSize, data]);

  const results = useMemo(() => {
    const observations: Array<FHIRObservationResource> = data
      ? [].concat(...data?.map((resp) => resp.data?.entry?.map((e) => e.resource)))
      : null;
    return {
      observations,
      isLoading: !data && !error,
      conceptUuids: observations ? [...new Set(observations.map((obs) => getConceptUuid(obs)))] : null,
    };
  }, [data, error]);

  return results;
}

function useTestConcepts(conceptUuids: Array<string>) {
  const getUrl = (index) => {
    if (conceptUuids && index < conceptUuids.length) {
      return `/ws/rest/v1/concept/${conceptUuids[index]}?v=full`;
    }
    return null;
  };
  const { data, error } = useSWRInfinite<FetchResponse<Concept>>(getUrl, openmrsFetch, {
    initialSize: conceptUuids?.length ?? 1,
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });

  const results = useMemo(() => {
    const concepts: Array<Concept> = data ? [].concat(data?.map((resp) => resp.data)) : null;
    return {
      concepts,
      testConcepts: concepts
        ? concepts.filter((c) => c.conceptClass.display === 'Test' || c.conceptClass.display === 'LabSet')
        : null,
      isLoading: !data && !error,
    };
  }, [data, error]);

  return results;
}

export default function usePanelData() {
  const { observations, conceptUuids, isLoading: isLoadingObservations } = useObservations();
  const { isLoading: isLoadingTestConcepts, testConcepts } = useTestConcepts(conceptUuids);
  const conceptData: Record<string, ConceptMeta> = isLoadingTestConcepts
    ? {}
    : Object.fromEntries(
        testConcepts?.map((concept) => [
          concept.uuid,
          {
            display: concept.display,
            ...extractMetaInformation(concept),
          },
        ]),
      );
  console.log(conceptData);

  const obsByClass: Record<string, ObsRecord[]> = Object.fromEntries(testConcepts?.map((x) => [x.uuid, []]) ?? []);
  // obs that are not panels
  const singeEntries = [];
  // a record of observation uuids that are members of panels, mapped to the place where to put them
  const memberRefs = {};

  const parseObservation = (observation: ObsRecord) => {
    observation.conceptClass = getConceptUuid(observation);

    if (observation.hasMember) {
      // is a panel
      observation.members = new Array(observation.hasMember.length);
      observation.hasMember.forEach((memb, i) => {
        memberRefs[memb.reference.split('/')[1]] = [observation.members, i];
      });
    } else {
      // is a singe test
      observation.meta = extractMetaInformation[observation.conceptClass];
    }

    if (observation.valueQuantity) {
      observation.value = observation.valueQuantity.value;
      delete observation.valueQuantity;
    }

    observation.name = conceptData[observation.conceptClass].display;
  };

  if (!isLoadingTestConcepts && !isLoadingObservations) {
    (observations as Array<ObsRecord>)?.forEach((obs) => {
      if (!testConcepts.map((concept) => concept.uuid).includes(obs.code.coding[0].code)) {
        return null;
      }

      parseObservation(obs as ObsRecord);

      if (obs.members) {
        obsByClass[obs.conceptClass].push(obs);
      } else {
        singeEntries.push(obs);
      }
    });
  }

  singeEntries.forEach((entry) => {
    const { id } = entry;
    const memRef = memberRefs[id];

    if (memRef) {
      memRef[0][memRef[1]] = entry;
    } else {
      obsByClass[entry.conceptClass].push(entry);
    }
  });

  const sortedObs = Object.fromEntries(
    Object.entries(obsByClass)
      // remove concepts that did not have any observations
      .filter((x) => x[1].length)
      // replace the uuid key with the display name and sort the observations by date
      .map(([uuid, val]) => {
        const {
          display,
          conceptClass: { display: type },
        } = testConcepts.find((x) => x.uuid === uuid);
        return [
          display,
          {
            entries: val.sort((ent1, ent2) => Date.parse(ent2.effectiveDateTime) - Date.parse(ent1.effectiveDateTime)),
            type,
            uuid,
          },
        ];
      }),
  );

  console.log(sortedObs);

  return sortedObs;
}
