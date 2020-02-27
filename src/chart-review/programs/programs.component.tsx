import React from "react";
import { useRouteMatch } from "react-router-dom";
import ChartWidget from "../../view-components/multi-dashboard/multi-dashboard.component";
import ProgramsSummary from "../../widgets/programs/programs-summary.component";

export default function Programs(props: any) {
  const match = useRouteMatch();

  const widgetConfig = {
    name: "programs",
    defaultTabIndex: 1,
    tabs: [
      {
        name: "Overview",
        component: () => {
          return <div>Placeholder</div>;
        }
      },
      {
        name: "Programs",
        component: () => {
          return <ProgramsSummary />;
        }
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
