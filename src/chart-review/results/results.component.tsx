import React from "react";
import { useRouteMatch, useLocation } from "react-router-dom";
import VitalsDetailedSummary from "../../widgets/vitals/vitals-detailed-summary.component";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";
import ResultsChartOverview from "./results-chart-overview.component";
import HeightAndWeightSummary from "../../widgets/heightandweight/heightandweight-summary.component";
import { HeightAndWeightDetailedSummary } from "../../widgets/heightandweight/heightandweight-detailed-summary.component";

export default function Results(props: any) {
  const match = useRouteMatch();
  let queryParams = new URLSearchParams(useLocation().search);

  const widgetConfig = {
    name: "results",
    defaultTabIndex: 0,
    tabs: [
      {
        name: "Overview",
        component: () => {
          return <ResultsChartOverview />;
        }
      },
      {
        name: "Vitals",
        component: () => {
          return <VitalsDetailedSummary match={match} />;
        }
      },
      {
        name: "Height and Weight",
        component: () => {
          return <HeightAndWeightSummary match={match} />;
        }
      }
    ]
  };

  if (queryParams.get("tab") && queryParams.get("uuid")) {
    let selectedTab = widgetConfig.tabs.findIndex(
      element => element.name === queryParams.get("tab")
    );
    switch (queryParams.get("tab")) {
      case "Height and Weight":
        widgetConfig.tabs.splice(selectedTab, 1, {
          name: "Height and Weight",
          component: () => {
            return (
              <HeightAndWeightDetailedSummary
                match={match}
                uuid={queryParams.get("uuid")}
              />
            );
          }
        });
    }
  }

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
