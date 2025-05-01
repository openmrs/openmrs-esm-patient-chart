import { useCallback, useEffect, useMemo } from 'react';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRInfinite from 'swr/infinite';
import { extractMetaInformation, getConceptUuid } from './helper';
import {
  type Concept,
  type ConceptMeta,
  type FHIRObservationResource,
  type FhirResponse,
  type ObsRecord,
} from '../../types';

export function useObservations(patientUuid: string) {
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
  const { data, size, setSize, isLoading } = useSWRInfinite<
    FetchResponse<FhirResponse<FHIRObservationResource>>,
    Error
  >(getUrl, openmrsFetch, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    // Infinitely fetching all the data
    if (data && data?.length === size && data?.[data.length - 1]?.data?.link?.some((x) => x.relation === 'next')) {
      setSize(size + 1);
    }
  }, [size, setSize, data]);

  const results = useMemo(() => {
    const observations: Array<FHIRObservationResource> = data
      ? []
          .concat(...data?.map((resp) => resp?.data?.entry?.map((e) => e.resource) ?? []))
          .sort((obs1, obs2) => Date.parse(obs2.effectiveDateTime) - Date.parse(obs1.effectiveDateTime))
      : null;
    return {
      observations,
      isLoading,
      conceptUuids: observations ? [...new Set(observations.map((obs) => getConceptUuid(obs)))] : null,
    };
  }, [data, isLoading]);

  return results;
}

function useConcepts(conceptUuids: Array<string>) {
  const getUrl = useCallback(
    (index: number) => {
      if (conceptUuids && index < conceptUuids.length) {
        return `${restBaseUrl}/concept/${conceptUuids[index]}?v=full`;
      }
      return null;
    },
    [conceptUuids],
  );
  const { data, isLoading } = useSWRInfinite<FetchResponse<Concept>>(getUrl, openmrsFetch, {
    initialSize: conceptUuids?.length ?? 1,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const results = useMemo(() => {
    const concepts: Array<Concept> = data ? [].concat(data?.map((resp) => resp.data)) : null;
    return {
      concepts: concepts
        ? concepts.filter((c) => c.conceptClass.display === 'Test' || c.conceptClass.display === 'LabSet')
        : null,
      // If there are no observations, hence no concept UUIDS, then it should return isLoading as false
      isLoading: conceptUuids?.length === 0 ? false : isLoading,
    };
  }, [data, conceptUuids, isLoading]);

  return results;
}

export default function usePanelData(patientUuid: string) {
  const {
    observations: fhirObservations,
    conceptUuids,
    isLoading: isLoadingObservations,
  } = useObservations(patientUuid);
  const { concepts } = useConcepts(conceptUuids);

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

  const observations: Array<ObsRecord> = useMemo(
    () =>
      fhirObservations?.map((observation) => {
        const conceptUuid = getConceptUuid(observation);
        const value = getObservationValue(observation);

        // is a singe test
        const meta = conceptData[conceptUuid];
        const interpretation = meta?.getInterpretation(value);

        const name = observation?.code.coding[0].display;
        return {
          ...observation,
          conceptUuid,
          value,
          meta,
          interpretation,
          name,
          relatedObs: [],
        };
      }),
    [fhirObservations, conceptData],
  );

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

  const panelsData = useMemo(
    () => ({
      panels,
      isLoading: isLoadingObservations,
      groupedObservations,
      conceptData,
    }),
    [panels, isLoadingObservations, groupedObservations, conceptData],
  );

  return panelsData;
}

const getObservationValue = (observation: FHIRObservationResource) => {
  if (observation?.valueQuantity) {
    return `${observation?.valueQuantity?.value}`;
  } else if (observation?.valueCodeableConcept) {
    return observation.valueCodeableConcept.text;
  }
  return observation.valueString;
};
