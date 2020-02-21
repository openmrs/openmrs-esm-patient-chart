import React from "react";
import Dashboard, {
  DashboardConfigType
} from "../../ui-components/dashboard/dashboard.component";
import MedicationsOverview from "../../widgets/medications/medications-overview.component";

export default function OrdersChartOverview(props: OrdersChartOverviewProps) {
  const config: DashboardConfigType = {
    layout: { columns: 1 },
    widgets: [{ name: "medications-overview", component: MedicationsOverview }]
  };

  return <Dashboard dashboardConfig={config} />;
}

type OrdersChartOverviewProps = {};
