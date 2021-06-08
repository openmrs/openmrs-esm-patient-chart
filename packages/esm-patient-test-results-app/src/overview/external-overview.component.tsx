import React from 'react';

import DataTableSkeleton from 'carbon-components-react/lib/components/DataTableSkeleton';

import { parseSingleEntry, OverviewPanelEntry } from './useOverviewData';
import { RecentResultsGrid, Card } from './helpers';
import CommonOverview from './common-overview';
import usePatientResultsData from '../loadPatientTestData/usePatientResultsData';
import { ObsRecord } from '../loadPatientTestData/types';

const RECENT_COUNT = 2;

export interface RecentOverviewProps {
  patientUuid: string;
  filter: (filterProps: PanelFilterProps) => boolean;
}

type PanelFilterProps = [entry: ObsRecord, uuid: string, type: string, panelName: string];

function useFilteredOverviewData(patientUuid: string, filter: (filterProps: PanelFilterProps) => boolean = () => true) {
  const { sortedObs, loaded, error } = usePatientResultsData(patientUuid);
  const [overviewData, setDisplayData] = React.useState<Array<OverviewPanelEntry>>([]);

  React.useEffect(() => {
    setDisplayData(
      Object.entries(sortedObs)
        .flatMap(([panelName, { entries, type, uuid }]) => {
          return entries.map((e) => [e, uuid, type, panelName] as PanelFilterProps);
        })
        .filter(filter)
        .map(([entry, uuid, type, panelName]: PanelFilterProps): OverviewPanelEntry => {
          return [panelName, type, parseSingleEntry(entry, type, panelName), new Date(entry.effectiveDateTime), uuid];
        })
        .sort(([, , , date1], [, , , date2]) => date2.getTime() - date1.getTime()),
    );
  }, [sortedObs]);

  return { overviewData, loaded, error };
}

const RecentOverview: React.FC<RecentOverviewProps> = ({ patientUuid, filter }) => {
  const { overviewData, loaded, error } = useFilteredOverviewData(patientUuid, filter);

  return (
    <RecentResultsGrid>
      {loaded ? (
        <>
          <CommonOverview
            {...{
              patientUuid,
              overviewData: overviewData.slice(0, RECENT_COUNT),
              insertSeperator: true,
              deactivateToolbar: true,
            }}
          />
        </>
      ) : (
        <Card>
          <DataTableSkeleton columnCount={3} />
        </Card>
      )}
    </RecentResultsGrid>
  );
};

export default RecentOverview;
