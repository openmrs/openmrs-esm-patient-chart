import React from "react";
import { Overview } from "../overview/overview.component";
import { Timeline } from "../timeline/timeline.component";
import Trendline from "../trendline/trendline.component";
import withDashboardRouting from "../withDashboardRouting";
import { navigate } from "@openmrs/esm-framework";

const Grid: React.FC<{}> = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "600px 1fr",
      gap: "20px",
      height: "calc(100vh - 48px)",
      width: "100%",
    }}
  >
    {children}
  </div>
);

const OverflowBorder: React.FC<{}> = ({ children }) => (
  <div
    style={{
      height: "100%",
      width: "100%",
      position: "relative",
      overflow: "auto",
    }}
  >
    {children}
  </div>
);

interface NoneViewState {
  type: "none";
}

interface TimelineViewState {
  type: "timeline";
  panelUuid: string;
}

interface TrendlineViewState {
  type: "trendline";
  panelUuid: string;
  testUuid: string;
}

type ViewState = NoneViewState | TimelineViewState | TrendlineViewState;

const deduceViewState = ({ panelUuid, testUuid, type = "none" }): ViewState => {
  switch (type) {
    case "timeline":
      if (panelUuid) return { type: "timeline", panelUuid };

    case "trendline":
      if (panelUuid && testUuid)
        return { type: "trendline", panelUuid, testUuid };

    case "none":
    default:
      return { type: "none" };
  }
};

const LabResults: React.FC<Record<string, any>> = ({
  patientUuid,
  panelUuid,
  testUuid,
  type,
  basePath,
}) => {
  const [viewState, setViewState] = React.useState<ViewState>(
    deduceViewState({ panelUuid, testUuid, type })
  );

  React.useEffect(() => {
    setViewState(deduceViewState({ panelUuid, testUuid, type }));
  }, [panelUuid, testUuid, type]);

  const openTimeline = React.useCallback(
    (panelUuid) => {
      navigate({ to: `${basePath}/timeline/${panelUuid}` });
    },
    [basePath]
  );

  const openTrendline = React.useCallback(
    (panelUuid, testUuid) =>
      navigate({ to: `${basePath}/trendline/${panelUuid}/${testUuid}` }),
    [basePath]
  );

  return (
    <Grid>
      <OverflowBorder>
        <Overview
          patientUuid={patientUuid}
          openTimeline={openTimeline}
          openTrendline={openTrendline}
        ></Overview>
      </OverflowBorder>
      <OverflowBorder>
        {(() => {
          switch (viewState.type) {
            case "timeline":
              return (
                <Timeline
                  patientUuid={patientUuid}
                  panelUuid={viewState.panelUuid}
                  key={viewState.panelUuid}
                  openTrendline={openTrendline}
                />
              );

            case "trendline":
              return (
                <Trendline
                  patientUuid={patientUuid}
                  panelUuid={viewState.panelUuid}
                  testUuid={viewState.testUuid}
                  openTimeline={openTimeline}
                />
              );

            case "none":
            default:
              return <div></div>;
          }
        })()}
      </OverflowBorder>
    </Grid>
  );
};

export default withDashboardRouting(LabResults);
