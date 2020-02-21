import React from "react";
import styles from "../summaries/overview/patient-chart-overview.css";
import VitalsOverview from "../../widgets/vitals/vitals-overview.component";
import HeightAndWeightOverview from "../../widgets/heightandweight/heightandweight-overview.component";
import Dashboard, {
  DashboardConfig
} from "../../ui-components/dashboard/dashboard.component";

export default function ResultsChartOverview(props: ResultsChartOverviewProps) {
  const config: DashboardConfig = {
    layout: { columns: 1 },
    widgets: [
      { name: "Vitals", component: VitalsOverview },
      { name: "Height and Weight", component: HeightAndWeightOverview }
    ]
  };

  return <Dashboard dashboardConfig={config} />;
}

type ResultsChartOverviewProps = {};
