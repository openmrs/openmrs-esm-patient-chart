import * as React from "react";
import { OBSERVATION_INTERPRETATION } from "../loadPatientTestData/helpers";

import usePatientResultsData from "../loadPatientTestData/usePatientResultsData";

interface OverviewPanelData {
  id: string;
  key?: string;
  name: string;
  range: string;
  interpretation: OBSERVATION_INTERPRETATION;
  value?: string | number;
}

export type OverviewPanelEntry = [
  string,
  string,
  OverviewPanelData[],
  Date,
  string
];

const useOverviewData = (patientUuid: string) => {
  //   const [isLoadingPatient, existingPatient, patientUuid, patientErr] = useCurrentPatient();
  const { sortedObs, loaded, error } = usePatientResultsData(patientUuid);
  const [overviewData, setDisplayData] = React.useState<OverviewPanelEntry[]>(
    []
  );

  React.useEffect(() => {
    setDisplayData(
      Object.entries(sortedObs)
        .map(([panelName, { entries, type, uuid }]) => {
          const newestEntry = entries[0];

          let data: OverviewPanelData[];

          if (type === "Test") {
            data = [
              {
                id: newestEntry.id,
                name: panelName,
                range: newestEntry.meta?.range || "--",
                interpretation: newestEntry.meta.assessValue(newestEntry.value),
                value: newestEntry.value,
              },
            ];
          } else {
            data = newestEntry.members.map((gm) => ({
              id: gm.id,
              key: gm.id,
              name: gm.name,
              range: gm.meta?.range || "--",
              interpretation: gm.meta.assessValue(gm.value),
              value: gm.value,
            }));
          }

          return [
            panelName,
            type,
            data,
            new Date(newestEntry.effectiveDateTime),
            uuid,
          ] as OverviewPanelEntry;
        })
        .sort(
          ([, , , date1], [, , , date2]) => date2.getTime() - date1.getTime()
        )
    );
  }, [sortedObs]);

  return { overviewData, loaded, error };
};

export default useOverviewData;
