import React from "react";
import { useParams } from "react-router-dom";
import ChartWidget from "../ui-components/chart-widget/chart-widget.component";
import PatientChartOverview from "../summaries/overview/patient-chart-overview.component";

export default function Summaries(props: any) {
  let { patientUuid } = useParams();
  const widgetConfig = {
    name: "summaries",
    path: "/summaries",
    defaultRoute: "overview",
    routes: [
      {
        name: "Overview",
        path: "/patient/:patientUuid/chart/summaries/overview",
        link: `/patient/${patientUuid}/chart/summaries/overview`,
        component: PatientChartOverview
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}

