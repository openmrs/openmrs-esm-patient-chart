import React from "react";
import { useRouteMatch } from "react-router-dom";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";
import HistoryChartOverview from "./history-chart-overview.component";
import ProgramsLevelTwo from "../../widgets/programs/programs-level-two.component";
import ConditionsDetailedSummary from "../../widgets/conditions/conditions-detailed-summary.component";
import { AllergyOverviewLevelTwo } from "../../widgets/allergies/allergy-card-level-two.component";

export default function History(props: any) {
  const match = useRouteMatch();

  const widgetConfig = {
    name: "history",
    defaultTabIndex: 0,
    tabs: [
      {
        name: "Overview",
        component: () => {
          return <div>Placeholder</div>;
        }
      },
      {
        name: "Conditions",
        component: () => {
          return <div>Placeholder</div>;
        }
      },
      {
        name: "Programs",
        component: () => {
          return <ProgramsLevelTwo match={match} />;
        }
      },
      {
        name: "Allergies",
        component: () => {
          return <div>Placeholder</div>;
        }
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
