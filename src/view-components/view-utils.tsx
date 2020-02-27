import React from "react";

import Dashboard from "./dashboard/dashboard.component";
import MultiDashboard from "./multi-dashboard/multi-dashboard.component";

import { coreWidgets, coreDashboards, coreMultiDashboards } from "./core-views";
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
  if (coreMultiDashboards[name]) {
    return {
      ...coreMultiDashboards[name],
      component: () => (
        <MultiDashboard
          key={name}
          config={coreMultiDashboards[name]}
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
