import React, { useEffect } from "react";
import { openmrsFetch } from "@openmrs/esm-framework";
import first from "lodash-es/first";

export interface ConceptMetaData {
  uuid: string;
  display: string;
  hiNormal: number | string | null;
  hiAbsolute: number | string | null;
  hiCritical: number | string | null;
  lowNormal: number | string | null;
  lowAbsolute: number | string | null;
  lowCritical: number | string | null;
  units: string | null;
}
export function useVitalsSignsConceptMetaData() {
  const [
    vitalsSignsConceptMetadata,
    setVitalsSignsConceptMetadata,
  ] = React.useState<Array<ConceptMetaData>>([]);
  const customRepresentation = `?q=VITALS SIGNS&v=custom:(setMembers:(uuid,display,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units))`;
  useEffect(() => {
    const ac = new AbortController();
    if (vitalsSignsConceptMetadata) {
      openmrsFetch(`/ws/rest/v1/concept${customRepresentation}`, {
        signal: ac.signal,
      }).then(({ data }) => {
        setVitalsSignsConceptMetadata(
          first<{ setMembers: Array<ConceptMetaData> }>(data.results).setMembers
        );
      });
    }
    return () => ac && ac.abort();
  }, []);

  const conceptsUnits = vitalsSignsConceptMetadata.map(
    (conceptUnit) => conceptUnit.units
  );

  return { vitalsSignsConceptMetadata, conceptsUnits };
}
