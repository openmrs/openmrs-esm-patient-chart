import React from "react";
import { useRouteMatch } from "react-router-dom";
import { newWorkspaceItem } from "../../workspace/workspace.resource";
import ChartWidget from "../../view-components/multi-dashboard/multi-dashboard.component";
import MedicationsLevelTwo from "../../widgets/medications/medication-level-two.component";
import { MedicationOrderBasket } from "../../widgets/medications/medication-order-basket.component";

export default function Orders(props: any) {
  const match = useRouteMatch();

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
          return <div>placeholder</div>;
        }
      },
      {
        name: "Medications",
        component: () => {
          return <MedicationsLevelTwo match={match} />;
        }
      }
    ]
  };

  return (
    <>
      <ChartWidget {...props} widgetConfig={widgetConfig} />
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
