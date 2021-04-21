import React from "react";
import DataTableSkeleton from "carbon-components-react/lib/components/DataTableSkeleton";
import { useParams } from "react-router-dom";
import useOverviewData from "./useOverviewData";
import { Main, Card } from "./helpers";
import withWorkspaceRouting from "../withWorkspaceRouting";
import CommonOverview from "./common-overview";
import { switchTo } from "@openmrs/esm-framework";

const defaultOpenTimeline = (patientUuid, panelUuid) => {
  const url = `/patient/${patientUuid}/testresults/timeline/${panelUuid}`;
  switchTo("workspace", url, {
    title: "Timeline",
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
        <CommonOverview
          overviewData={overviewData}
          patientUuid={patientUuid}
          openTimeline={openTimeline}
          openTrendline={openTrendline}
        />
      ) : (
        <Card>
          <DataTableSkeleton columnCount={3} />
        </Card>
      )}
    </>
  );
};

export default withWorkspaceRouting<LabResultProps, LabResultParams>(Overview);
