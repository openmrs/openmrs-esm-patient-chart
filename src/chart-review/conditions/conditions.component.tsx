import React from "react";
import { useRouteMatch } from "react-router-dom";
import ChartWidget from "../../view-components/multi-dashboard/multi-dashboard.component";
import ConditionsDetailedSummary from "../../widgets/conditions/conditions-detailed-summary.component";

export default function Conditions(props: any) {
  const match = useRouteMatch();

  const widgetConfig = {
    name: "conditions",
    defaultTabIndex: 1,
    tabs: [
      {
        name: "Overview",
        component: () => {
          return <div>Placeholder</div>;
        }
      },
      {
        name: "Conditions",
        component: () => {
          return <ConditionsDetailedSummary />;
        }
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
