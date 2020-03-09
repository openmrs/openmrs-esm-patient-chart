import React from "react";

import Dashboard from "./dashboard/dashboard.component";
import TabbedView from "./tabbed-view/tabbed-view.component";

import Widget from "./widget/widget.component";
import {
  coreWidgetDefinitions,
  coreDashboardDefinitions,
  coreTabbedViewDefinitions
} from "./core-views";

export function getView(
  name: string,
  config: any,
  defaultPath: any
): View | null {
  const widget =
    config.widgetDefinitions.find(widget => widget.name === name) ||
    coreWidgetDefinitions.find(widget => widget.name === name);

  if (widget) {
    return { name, component: () => <Widget widgetConfig={widget} /> };
  }

  const dashboard =
    config.dashboardDefinitions.find(dashboard => dashboard.name === name) ||
    coreDashboardDefinitions.find(dashboard => dashboard.name === name);

  if (dashboard) {
    return {
      ...dashboard,
      component: () => <Dashboard dashboardConfig={dashboard} />
    };
  }

  const tabbedView =
    config.tabbedViewDefinitions.find(tabbedView => tabbedView.name === name) ||
    coreTabbedViewDefinitions.find(tabbedView => tabbedView.name === name);

  if (tabbedView) {
    return {
      ...tabbedView,
      component: () => (
        <TabbedView config={tabbedView} defaultPath={defaultPath} />
      )
    };
  }

  return { name, component: () => <div>View "{name}" does not exist.</div> };
}

export type View = {
  label?: string;
  path?: string;
  name: string;
  component: Function | null;
};
