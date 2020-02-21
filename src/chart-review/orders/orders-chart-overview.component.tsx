import React from "react";
import styles from "../summaries/overview/patient-chart-overview.css";
import Dashboard, {
  DashboardConfig
} from "../../ui-components/dashboard/dashboard.component";
import MedicationsOverview from "../../widgets/medications/medications-overview.component";

export default function OrdersChartOverview(props: OrdersChartOverviewProps) {
  const config: DashboardConfig = {
    layout: { columns: 1 },
    widgets: [{ name: "medications-overview", component: MedicationsOverview }]
  };

  return <Dashboard dashboardConfig={config} />;
}

type OrdersChartOverviewProps = {};
