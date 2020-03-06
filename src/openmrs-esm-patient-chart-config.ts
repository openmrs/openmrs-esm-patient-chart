import { defineConfigSchema, validators } from "@openmrs/esm-module-config";
import {
  widgetDefinitions,
  dashboardDefinitions,
  tabbedViewDefinitions
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
        view: "ConditionsOverview"
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
      esModule: { validators: [validators.isString] }
    },
    default: widgetDefinitions
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
          layout: {
            rowSpan: {},
            columnSpan: {}
          }
        }
      }
    },
    default: dashboardDefinitions
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
    default: tabbedViewDefinitions
  }
};
