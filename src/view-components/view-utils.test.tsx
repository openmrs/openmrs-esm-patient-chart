import React from "react";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { getView } from "./view-utils";
import {
  coreWidgetDefinitions,
  coreDashboardDefinitions,
  coreTabbedViewDefinitions
} from "./core-views";

declare var System;

describe(`view-utils`, () => {
  const originalError = console.error;

  const testWidgetDefinitions = [
    {
      name: "widget1"
    }
  ];

  const testDashboardDefinitions = [
    {
      name: "testDashboard",
      layout: { columns: 1 },
      widgets: [
        {
          name: "widget2"
        },
        {
          name: "widget3"
        }
      ]
    }
  ];

  const testTabbedViewDefinitions = [
    {
      name: "testTabbedView",
      title: "Test Tabbied View",

      navbar: [
        {
          label: "Tab 1",
          path: "/tab1",
          view: "testDashboard"
        },
        {
          label: "Tab 2",
          path: "/tab2",
          view: "widget1"
        }
      ]
    }
  ];

  const config = {
    widgetDefinitions: testWidgetDefinitions,
    dashboardDefinitions: testDashboardDefinitions,
    tabbedViewDefinitions: testTabbedViewDefinitions
  };

  const mockedModule = {
    widget1: () => <div>Test Widget 1</div>,
    widget2: () => <div>Test Widget 2</div>,
    widget3: () => <div>Test Widget 3</div>
  };

  afterAll(() => {
    console.error = originalError;
  });

  afterEach(() => {
    cleanup();
  });

  it("should get widget from core-views", () => {
    const view = getView(coreWidgetDefinitions[0].name, config, "");
    expect(view.name).toBe(coreWidgetDefinitions[0].name);
  });

  it(`should get widget using config`, async done => {
    const view = getView("test1", config, "");
    expect(view.name).toBe("test1");
    done();
  });

  it("should get dashboard from core-views", () => {
    const view = getView(coreDashboardDefinitions[0].name, config, "");
    expect(view.name).toBe(coreDashboardDefinitions[0].name);
  });

  it(`should get dashboard using config`, async done => {
    const view = getView("testDashboard", config, "");
    expect(view.name).toBe("testDashboard");
    done();
  });

  it("should get tabbedView from core-views", () => {
    const view = getView(coreTabbedViewDefinitions[0].name, config, "");
    expect(view.name).toBe(coreTabbedViewDefinitions[0].name);
  });

  it(`should get tabbedView using config`, async done => {
    const view = getView("testTabbedView", config, "");
    expect(view.name).toBe("testTabbedView");
    done();
  });

  it(`should return that the view does not exist`, () => {
    const view = getView("doesNotExist", config, "");
    const { queryByText } = render(view.component());
    expect(queryByText(" does not exist", { exact: false })).not.toBe(null);
  });
});
