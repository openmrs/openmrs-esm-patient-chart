import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { type FetchResponse, fhirBaseUrl, openmrsFetch, restBaseUrl, useFhirFetchAll } from '@openmrs/esm-framework';
import { extractMetaInformation, getConceptUuid } from './helper';
import { type Concept, type ConceptMeta, type FHIRObservationResource, type ObsRecord } from '../../types';

export function useObservations(patientUuid: string) {
  const { data, isLoading } = useFhirFetchAll<FHIRObservationResource>(
    patientUuid ? `${fhirBaseUrl}/Observation?category=laboratory&patient=${patientUuid}&_count=100` : null,
    {
      swrInfiniteConfig: {
        revalidateIfStale: false,
        revalidateOnFocus: false,
      },
    },
  );

  return useMemo(() => {
    const observations = data
      ? [...data].sort((obs1, obs2) => Date.parse(obs2.effectiveDateTime) - Date.parse(obs1.effectiveDateTime))
      : null;
    return {
      observations,
      isLoading,
      conceptUuids: observations ? [...new Set(observations.map((obs) => getConceptUuid(obs)))] : null,
    };
  }, [data, isLoading]);
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

        const name = observation?.code?.coding?.[0]?.display;
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

  const setObservations: Array<ObsRecord> = useMemo(() => {
    if (!observations) {
      return [];
    }

    // Create a map of individual observations for efficient lookup
    const individualObsMap = new Map(individualObservations.map((obs) => [obs.id, obs]));
    const usedIndividualObsIds = new Set<string>();

    return observations
      .filter((obs) => !!obs.hasMember)
      .map((obs) => {
        const relatedObs: Array<ObsRecord> = [];
        obs.hasMember.forEach((memb) => {
          const membUuid = memb.reference.split('/')[1];
          const memberObs = individualObsMap.get(membUuid);
          if (memberObs && !usedIndividualObsIds.has(membUuid)) {
            relatedObs.push(memberObs);
            usedIndividualObsIds.add(membUuid);
          }
        });
        return {
          ...obs,
          relatedObs,
        };
      });
  }, [individualObservations, observations]);

  const remainingIndividualObservations = useMemo(() => {
    const usedIds = new Set<string>();
    setObservations.forEach((setObs) => {
      setObs.relatedObs.forEach((relatedObs) => {
        usedIds.add(relatedObs.id);
      });
    });
    return individualObservations.filter((obs) => !usedIds.has(obs.id));
  }, [individualObservations, setObservations]);

  const panels = useMemo(() => {
    const allPanels = [...remainingIndividualObservations, ...setObservations].sort(
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
  }, [remainingIndividualObservations, setObservations]);

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
