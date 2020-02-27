import React from "react";
import { useRouteMatch } from "react-router-dom";
import ChartWidget from "../../view-components/multi-dashboard/multi-dashboard.component";

export default function Summaries(props: any) {
  const match = useRouteMatch();

  const widgetConfig = {
    name: "summaries",
    defaultTabIndex: 0,
    tabs: [
      {
        name: "Overview",
        component: () => {
          return <div>placeholder</div>;
        }
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
