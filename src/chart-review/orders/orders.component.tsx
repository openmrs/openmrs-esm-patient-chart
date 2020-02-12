import React from "react";
import { useParams } from "react-router-dom";
import { newWorkspaceItem } from "../../workspace/workspace.resource";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";
import MedicationsLevelTwo from "../../widgets/medications/medication-level-two.component";
import { MedicationOrderBasket } from "../../widgets/medications/medication-order-basket.component";
import OrdersChartOverview from "./orders-chart-overview.component";

export default function Orders(props: any) {
  let { patientUuid } = useParams();

  function showOrders() {
    newWorkspaceItem({
      component: MedicationOrderBasket,
      name: "Medication Order Basket",
      props: { match: { params: {} } },
      inProgress: false
    });
  }

  const widgetConfig = {
    name: "orders",
    defaultTabIndex: 0,
    tabs: [
      {
        name: "Overview",
        component: () => {
          return <OrdersChartOverview />;
        }
      },
      {
        name: "Medications",
        component: () => {
          return <MedicationsLevelTwo />;
        }
      }
    ]
  };

  return (
    <>
      <ChartWidget {...props} widgetConfig={widgetConfig} />;
      <div>
        <button
          className="omrs-unstyled"
          onClick={showOrders}
          style={{ padding: "1rem", width: "100%" }}
        >
          Create Orders
        </button>
      </div>
    </>
  );
}
