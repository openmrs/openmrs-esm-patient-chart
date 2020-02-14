import React from "react";
import { useRouteMatch } from "react-router-dom";
import VitalsDetailedSummary from "../../widgets/vitals/vitals-detailed-summary.component";
import HeightAndWeightDetailed from "../../widgets/heightandweight/heightandweight-detailed.component";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";
import ResultsChartOverview from "./results-chart-overview.component";

export default function Results(props: any) {
  const match = useRouteMatch();

  const widgetConfig = {
    name: "results",
    defaultTabIndex: 0,
    tabs: [
      {
        name: "Overview",
        component: () => {
          return <ResultsChartOverview />;
        }
      },
      {
        name: "Vitals",
        component: () => {
          return <VitalsDetailedSummary match={match} />;
        }
      },
      {
        name: "Height and Weight",
        component: () => {
          return <HeightAndWeightDetailed match={match} />;
        }
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
