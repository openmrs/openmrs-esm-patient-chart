import React from "react";
import { useParams } from "react-router-dom";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";
import PatientChartOverview from "./overview/patient-chart-overview.component";

export default function Summaries(props: any) {
  let { patientUuid } = useParams();

  const widgetConfig = {
    name: "summaries",
    defaultTabIndex: 0,
    tabs: [
      {
        name: "Overview",
        component: () => {
          return <PatientChartOverview />;
        }
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
