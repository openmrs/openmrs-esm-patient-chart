import React from "react";
import styles from "../summaries/overview/patient-chart-overview.css";
import VitalsOverview from "../../widgets/vitals/vitals-overview.component";
import HeightAndWeightOverview from "../../widgets/heightandweight/heightandweight-overview.component";
import Dashboard, {
  DashboardConfigType
} from "../../view-components/dashboard/dashboard.component";

export default function ResultsChartOverview(props: ResultsChartOverviewProps) {
  const config: DashboardConfigType = {
    name: "resultsOverview",
    title: "Results Overview",
    layout: { columns: 1 },
    widgets: [{ name: "vitalsOverview" }, { name: "heightAndWeightOverview" }]
  };

  return <Dashboard dashboardConfig={config} />;
}

type ResultsChartOverviewProps = {};
