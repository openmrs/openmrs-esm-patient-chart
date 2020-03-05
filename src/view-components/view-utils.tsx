import React from "react";

import Dashboard from "./dashboard/dashboard.component";
import TabbedView from "./tabbed-view/tabbed-view.component";

import Widget from "./widget/widget.component";

export function getView(
  name: string,
  config: any,
  defaultPath: any
): ViewType | null {
  const widget = config.widgetDefinitions.find(widget => widget.name === name);

  const dashboard = config.dashboardDefinitions.find(
    dashboard => dashboard.name === name
  );

  const tabbedView = config.tabbedViewDefinitions.find(
    tabbedView => tabbedView.name === name
  );

  if (widget) {
    return { name, component: () => <Widget widgetConfig={widget} /> };
  } else if (dashboard) {
    return {
      ...dashboard,
      component: () => <Dashboard dashboardConfig={dashboard} />
    };
  } else if (tabbedView) {
    return {
      ...tabbedView,
      component: () => (
        <TabbedView config={tabbedView} defaultPath={defaultPath} />
      )
    };
  } else {
    return { name, component: null };
  }
}

export type ViewType = {
  label?: string;
  path?: string;
  name: string;
  component: Function | null;
};
