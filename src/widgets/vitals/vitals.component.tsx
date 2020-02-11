import React from "react";
import { useParams } from "react-router-dom";
import VitalsChartOverview from "./vitals-chart-overview.component";
import VitalsDetailedSummary from "./vitals-detailed-summary.component";
import HeightAndWeightDetailed from "../heightandweight/heightandweight-detailed.component";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";

export default function Vitals(props: any) {
  let { patientUuid } = useParams();

  const widgetConfig = {
    name: "vitals",
    path: "/vitals",
    defaultRoute: "overview",
    routes: [
      {
        name: "Overview",
        path: "/patient/:patientUuid/chart/vitals/overview",
        link: `/patient/${patientUuid}/chart/vitals/overview`,
        component: VitalsChartOverview
      },
      {
        name: "Vitals",
        path: "/patient/:patientUuid/chart/vitals/vitals",
        link: `/patient/${patientUuid}/chart/vitals/vitals`,
        component: VitalsDetailedSummary
      },
      {
        name: "Height and weight",
        path: "/patient/:patientUuid/chart/vitals/height-and-weight/",
        link: `/patient/${patientUuid}/chart/vitals/height-and-weight`,
        component: HeightAndWeightDetailed
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
