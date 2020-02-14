import React from "react";
import { useRouteMatch } from "react-router-dom";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";
import ProgramsLevelTwo from "../../widgets/programs/programs-level-two.component";

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
          return <ProgramsLevelTwo match={match} />;
        }
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
