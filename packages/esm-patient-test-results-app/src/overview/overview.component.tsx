import React from 'react';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import useOverviewData from './useOverviewData';
import { Card } from './helpers';
import CommonOverview from './common-overview';
import { switchTo } from '@openmrs/esm-framework';

const defaultOpenTimeline = (patientUuid, panelUuid) => {
  const url = `/patient/${patientUuid}/testresults/timeline/${panelUuid}`;
  switchTo('workspace', url, {
    title: 'Timeline',
  });
};

interface LabResultProps {
  openTimeline?: (panelUuid) => void;
  openTrendline?: (panelUuid, testUuid) => void;
}

type LabResultParams = {
  patientUuid: string;
};

export const Overview: React.FC<LabResultProps & LabResultParams> = ({
  patientUuid,
  openTimeline = (panelUuid) => defaultOpenTimeline(patientUuid, panelUuid),
  openTrendline,
}) => {
  const { overviewData, loaded, error } = useOverviewData(patientUuid);

  return (
    <>
      {loaded ? (
        <CommonOverview overviewData={overviewData} openTimeline={openTimeline} openTrendline={openTrendline} />
      ) : (
        <Card>
          <DataTableSkeleton columnCount={3} />
        </Card>
      )}
    </>
  );
};
