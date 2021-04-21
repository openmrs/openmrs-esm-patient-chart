import React from "react";

import Button from "carbon-components-react/lib/components/Button";
import DataTableSkeleton from "carbon-components-react/lib/components/DataTableSkeleton";

import { switchTo, useCurrentPatient } from "@openmrs/esm-framework";

import useOverviewData from "./useOverviewData";
import { RecentResultsGrid, Card } from "./helpers";
import styles from "./lab-results.scss";
import CommonOverview from "./common-overview";

const RECENT_COUNT = 2;

interface LabResultsProps {
  patientUuid: string;
}

const withCurrentPatient = (WrappedComponent) => {
  const PureCompoent = React.memo(WrappedComponent);
  return (props) => {
    const [, , patientUuid] = useCurrentPatient();
    return <PureCompoent {...props} patientUuid={patientUuid} />;
  };
};

const LabResults: React.FC<LabResultsProps> = ({ patientUuid, ...rest }) => {
  const { overviewData, loaded, error } = useOverviewData(patientUuid);

  return (
    <RecentResultsGrid>
      <div className={styles["recent-overview-header-container"]}>
        <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>
          Recent Results ({Math.min(RECENT_COUNT, overviewData.length)})
        </h4>
        <Button
          kind="ghost"
          onClick={() => {
            const url = `/patient/${patientUuid}/testresults/overview`;
            switchTo("workspace", url, {
              title: "Overview",
              test: "from recent overview",
            });
          }}
        >
          All results
        </Button>
      </div>
      {loaded ? (
        <CommonOverview
          {...{
            patientUuid,
            overviewData: overviewData.slice(0, RECENT_COUNT),
            insertSeperator: true,
            openTimeline: (panelUuid) => {
              const url = `/patient/${patientUuid}/testresults/overview`;
              switchTo("workspace", url, {
                title: "Overview",
                initialState: { type: "timeline", panelUuid },
              });
            },
            openTrendline: (panelUuid, testUuid) => {
              const url = `/patient/${patientUuid}/testresults/overview`;
              switchTo("workspace", url, {
                title: "Overview",
                initialState: {
                  type: "trendline",
                  patientUuid,
                  panelUuid,
                },
              });
            },
          }}
        />
      ) : (
        <Card>
          <DataTableSkeleton columnCount={3} />
        </Card>
      )}
    </RecentResultsGrid>
  );
};

export default withCurrentPatient(LabResults);
