import { defineConfigSchema, validators } from "@openmrs/esm-module-config";
import {
  coreWidgetDefinitions,
  coreDashboardDefinitions,
  coreTabbedViewDefinitions
} from "./view-components/core-views";

export const esmPatientChartConfig = {
  primaryNavbar: {
    arrayElements: {
      label: { validators: [validators.isString] },
      path: { validators: [validators.isString] },
      view: { validators: [validators.isString] }
    },
    default: [
      {
        label: "Summary",
        path: "/summary",
        view: "summaryDashboard"
      },
      {
        label: "Results",
        path: "/results",
        view: "resultsTabbedView"
      },
      {
        label: "Orders",
        path: "/orders",
        view: "ordersTabbedView"
      },
      {
        label: "Encounters",
        path: "/encounters",
        view: "encountersOverviewDashboard"
      },
      {
        label: "Conditions",
        path: "/conditions",
        view: "conditionsOverviewDashboard"
      },
      {
        label: "Programs",
        path: "/programs",
        view: "programsOverviewDashboard"
      },
      {
        label: "Allergies",
        path: "/allergies",
        view: "allergiesOverviewDashboard"
      },
      {
        label: "Appointments",
        path: "/appointments",
        view: "appointmentsOverviewDashboard"
      }
    ]
  },
  widgetDefinitions: {
    arrayElements: {
      name: { validators: [validators.isString] },
      esModule: { validators: [validators.isString] },
      usesSingleSpaContext: { validators: [validators.isBoolean] }
    },
    default: coreWidgetDefinitions
  },

  dashboardDefinitions: {
    arrayElements: {
      name: { validators: [validators.isString] },
      title: { validators: [validators.isString] },
      layout: {
        columns: {}
      },
      widgets: {
        arrayElements: {
          name: { validators: [validators.isString] },
          esModule: { validators: [validators.isString] },
          usesSingleSpaContext: { validators: [validators.isBoolean] },
          layout: {
            rowSpan: {},
            columnSpan: {}
          }
        }
      }
    },
    default: coreDashboardDefinitions
  },

  tabbedViewDefinitions: {
    arrayElements: {
      name: { validators: [validators.isString] },
      title: { validators: [validators.isString] },
      navbar: {
        arrayElements: {
          label: { validators: [validators.isString] },
          path: { validators: [validators.isString] },
          view: { validators: [validators.isString] }
        }
      }
    },
    default: coreTabbedViewDefinitions
  }
};
