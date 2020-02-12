import React from "react";
import { useParams } from "react-router-dom";
import VitalsDetailedSummary from "../../widgets/vitals/vitals-detailed-summary.component";
import HeightAndWeightDetailed from "../../widgets/heightandweight/heightandweight-detailed.component";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";
import ResultsChartOverview from "./results-chart-overview.component";

export default function Results(props: any) {
  let { patientUuid } = useParams();

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
          return <VitalsDetailedSummary />;
        }
      },
      {
        name: "Height and Weight",
        component: () => {
          return <HeightAndWeightDetailed />;
        }
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
