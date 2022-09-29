import { useCallback, useEffect, useMemo } from 'react';
import { FetchResponse, openmrsFetch, usePatient } from '@openmrs/esm-framework';
import useSWRInfinite from 'swr/infinite';
import { extractMetaInformation, getConceptUuid } from './helper';
import { Concept, ConceptMeta, FHIRObservationResource, FhirResponse, LabSetRecord, ObsRecord } from './types';

export function useObservations() {
  const { patientUuid } = usePatient();
  const getUrl = useCallback(
    (pageIndex: number, prevPageData: FetchResponse<FhirResponse<FHIRObservationResource>>) => {
      if (prevPageData && !prevPageData?.data?.link.some(({ relation }) => relation === 'next')) {
        return null;
      }
      if (!patientUuid) {
        return null;
      }
      let url = '/ws/fhir2/R4/Observation';
      url += '?category=laboratory';
      url += `&patient=${patientUuid}`;
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
    console.log(data);
    const observations: Array<FHIRObservationResource> = data
      ? []
          .concat(...data?.map((resp) => resp.data?.entry?.map((e) => e.resource) ?? []))
          .sort((obs1, obs2) => Date.parse(obs2.effectiveDateTime) - Date.parse(obs1.effectiveDateTime))
      : null;
    return {
      observations,
      isLoading: !data && !error,
      conceptUuids: observations ? [...new Set(observations.map((obs) => getConceptUuid(obs)))] : null,
    };
  }, [data, error]);

  return results;
}

function useconcepts(conceptUuids: Array<string>) {
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
      concepts: concepts
        ? concepts.filter((c) => c.conceptClass.display === 'Test' || c.conceptClass.display === 'LabSet')
        : null,
      // If there are no observations, hence no concept UUIDS, then it should return isLoading as false
      isLoading: conceptUuids?.length === 0 ? false : !data && !error,
    };
  }, [data, error, conceptUuids]);

  return results;
}

export default function usePanelData() {
  const { observations: fhirObservations, conceptUuids, isLoading: isLoadingObservations } = useObservations();
  const { isLoading: isLoadingConcepts, concepts } = useconcepts(conceptUuids);

  console.log('obs', fhirObservations, isLoadingObservations);
  console.log('concepts', concepts, isLoadingConcepts);

  const conceptData: Record<string, ConceptMeta> = useMemo(
    () =>
      concepts
        ? Object.fromEntries(
            concepts?.map((concept) => [
              concept.uuid,
              {
                display: concept.display,
                ...extractMetaInformation(concept),
              },
            ]),
          )
        : {},
    [concepts],
  );

  const observations: Array<ObsRecord> = fhirObservations?.map((observation) => {
    const conceptUuid = getConceptUuid(observation);
    let value: number;
    if (observation?.valueQuantity) {
      value = observation.valueQuantity?.value;
      // delete observation.valueQuantity;
    }

    // is a singe test
    const meta = conceptData[conceptUuid];
    const interpretation = meta?.getInterpretation(value);

    const name = conceptData[conceptUuid]?.display;
    return {
      ...observation,
      conceptUuid,
      value,
      meta,
      interpretation,
      name,
      relatedObs: [],
    };
  });

  const groupedObservations: Record<string, Array<ObsRecord>> = useMemo(() => {
    const groups = {};
    if (observations) {
      observations.forEach((obs) => {
        if (groups[getConceptUuid(obs)]) {
          groups[getConceptUuid(obs)].push(obs);
        } else {
          groups[getConceptUuid(obs)] = [obs];
        }
      });
    }
    return groups;
  }, [observations]);

  const individualObservations = useMemo(
    () => (observations ? observations.filter((obs) => !obs.hasMember) : []),
    [observations],
  );

  const setObservations: Array<ObsRecord> = useMemo(
    () =>
      observations
        ? observations
            .filter((obs) => !!obs.hasMember)
            .map((obs) => {
              const relatedObs = [];
              obs.hasMember.forEach((memb) => {
                const membUuid = memb.reference.split('/')[1];
                const memberObservationIndex = individualObservations.findIndex((obs) => obs.id === membUuid);
                if (memberObservationIndex > -1) {
                  relatedObs.push(individualObservations[memberObservationIndex]);
                  individualObservations.splice(memberObservationIndex, 1);
                }
              });
              return {
                ...obs,
                relatedObs,
              };
            })
        : [],
    [individualObservations, observations],
  );

  const panels = useMemo(() => {
    const allPanels = [...individualObservations, ...setObservations].sort(
      (obs1, obs2) => Date.parse(obs2.effectiveDateTime) - Date.parse(obs1.effectiveDateTime),
    );
    const usedConcepts: Set<string> = new Set();
    const latestPanels: Array<ObsRecord> = [];
    allPanels.forEach((panel) => {
      if (usedConcepts.has(panel.conceptUuid)) return;
      usedConcepts.add(panel.conceptUuid);
      latestPanels.push(panel);
    });
    return latestPanels;
  }, [individualObservations, setObservations]);

  console.log(panels);

  return {
    panels,
    isLoading: isLoadingConcepts || isLoadingObservations,
    groupedObservations,
    conceptData,
  };
}
