import React from "react";

import Dashboard from "./dashboard/dashboard.component";
import MultiDashboard from "./tabbed-view/tabbed-view.component";

import { coreWidgets, coreDashboards, coreTabbedViews } from "./core-views";
import Widget from "./widget/widget.component";

export function getView(name: string, config: any, defaultPath: any): ViewType {
  return getCoreView(name, defaultPath) || getExternalView(config, name);
}

export function getCoreView(name: string, defaultPath: string): ViewType {
  if (coreWidgets[name]) {
    return coreWidgets[name];
  }
  if (coreDashboards[name]) {
    return {
      ...coreDashboards[name],
      component: () => (
        <Dashboard key={name} dashboardConfig={coreDashboards[name]} />
      )
    };
  }
  if (coreTabbedViews[name]) {
    return {
      ...coreTabbedViews[name],
      component: () => (
        <MultiDashboard
          key={name}
          config={coreTabbedViews[name]}
          defaultPath={defaultPath}
        />
      )
    };
  }
  return;
}

export function getExternalView(config: any, name: string): ViewType {
  const widget = config.widgetDefinitions.find(widget => widget.name === name);
  const dashboard = config.dashboardDefinitions.find(
    dashboard => dashboard.name === name
  );

  const multiDashboard = config.multiDashboardDefinitions.find(
    multiDashboard => multiDashboard.name === name
  );

  if (widget) {
    return { name, component: () => <Widget widgetConfig={widget} /> };
  } else if (dashboard) {
    return {
      ...dashboard,
      component: () => <Dashboard dashboardConfig={dashboard} />
    };
  } else if (multiDashboard) {
    return {
      ...multiDashboard,
      component: () => <MultiDashboard config={multiDashboard} />
    };
  } else {
    return { name, component: null };
  }
}

export type RouteType = {
  name: string;
  path: string;
  component: Function;
};

export type ViewType = {
  name: string;
  component: Function;
};
