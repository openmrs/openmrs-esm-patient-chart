import React from "react";
import styles from "../summaries/overview/patient-chart-overview.css";
import Overview from "../../ui-components/overview-widget/overview.component";
import MedicationsOverview from "../../widgets/medications/medications-overview.component";

export default function OrdersChartOverview(props: OrdersChartOverviewProps) {
  const config = [MedicationsOverview];

  return <Overview config={config} />;
}

type OrdersChartOverviewProps = {};
