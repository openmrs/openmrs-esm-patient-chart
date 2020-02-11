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
    path: "/results",
    defaultRoute: "overview",
    routes: [
      {
        name: "Overview",
        path: "/patient/:patientUuid/chart/results/overview",
        link: `/patient/${patientUuid}/chart/results/overview`,
        component: ResultsChartOverview
      },
      {
        name: "Vitals",
        path: "/patient/:patientUuid/chart/results/vitals",
        link: `/patient/${patientUuid}/chart/results/vitals`,
        component: VitalsDetailedSummary
      },
      {
        name: "Height and weight",
        path: "/patient/:patientUuid/chart/results/height-and-weight/",
        link: `/patient/${patientUuid}/chart/results/height-and-weight`,
        component: HeightAndWeightDetailed
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
