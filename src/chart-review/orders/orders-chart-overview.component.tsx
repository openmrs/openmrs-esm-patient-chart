import React from "react";
import Dashboard, {
  DashboardConfigType
} from "../../ui-components/dashboard/dashboard.component";

export default function OrdersChartOverview(props: OrdersChartOverviewProps) {
  const config: DashboardConfigType = {
    name: "ordersChartView",
    title: "Orders Chart Overview",
    layout: { columns: 1 },
    widgets: [{ name: "medicationsOverview" }]
  };

  return <Dashboard dashboardConfig={config} />;
}

type OrdersChartOverviewProps = {};
