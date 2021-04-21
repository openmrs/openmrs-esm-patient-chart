import React from "react";
import { useParams } from "react-router-dom";
import withWorkspaceRouting from "../withWorkspaceRouting";
import { Overview } from "../overview/overview.component";
import { Timeline } from "../timeline/timeline.component";
import Trendline from "../trendline/trendline.component";

// const Trendline: React.FC<Record<string, any>> = () => <div></div>;
const Grid: React.FC<{}> = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "600px 1fr",
      gap: "20px",
      height: "calc(100vh - 48px)",
      width: "100vw",
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

const LabResults: React.FC<{ initialState?: ViewState }> = ({
  initialState = { type: "none" },
}) => {
  const { patientUuid } = useParams<{
    patientUuid: string;
    panelUuid: string;
  }>();

  const [viewState, setViewState] = React.useState<ViewState>(initialState);

  const openTimeline = React.useCallback(
    (panelUuid) => {
      setViewState({ type: "timeline", panelUuid });
    },
    [setViewState]
  );

  const openTrendline = React.useCallback(
    (panelUuid, testUuid) =>
      setViewState({ type: "trendline", panelUuid, testUuid }),
    [setViewState]
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

export default withWorkspaceRouting(LabResults);
