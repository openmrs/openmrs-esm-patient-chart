import { validators } from "@openmrs/esm-module-config";
import {
  coreWidgetDefinitions,
  coreDashboardDefinitions,
  coreTabbedViewDefinitions
} from "../view-components/core-views";

export const esmPatientChartSchema = {
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
        label: "Attachments",
        path: "/attachments",
        view: "AttachmentsOverview"
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
        view: "encountersTabbedView"
      },
      {
        label: "Conditions",
        path: "/conditions",
        view: "conditionsDashboard"
      },
      {
        label: "Immunizations",
        path: "/immunizations",
        view: "immunizationsDashboard"
      },
      {
        label: "Programs",
        path: "/programs",
        view: "programsDashboard"
      },
      {
        label: "Allergies",
        path: "/allergies",
        view: "allergiesDashboard"
      },
      {
        label: "Appointments",
        path: "/appointments",
        view: "appointmentsDashboard"
      }
    ]
  },
  widgetDefinitions: {
    arrayElements: {
      name: { validators: [validators.isString] },
      esModule: { default: undefined, validators: [validators.isString] },
      extensionSlotName: {
        default: undefined,
        validators: [validators.isString]
      },
      usesSingleSpaContext: { validators: [validators.isBoolean] },
      props: { default: {}, validators: [validators.isObject] },
      config: { default: {}, validators: [validators.isObject] }
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
          props: { default: {}, validators: [validators.isObject] },
          config: { default: {}, validators: [validators.isObject] },
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

export type ChartConfig = {
  primaryNavbar: Array<Navbar>;
  widgetDefinitions: Array<{
    name: string;
    esModule?: string;
    label?: string;
    path?: string;
  }>;

  dashboardDefinitions: Array<{
    name: string;
    title: string;
    layout: { columns: number };
    widgets: Array<{
      name: string;
      esModule: string;
      label: string;
      path: string;
      layout: {
        rowSpan: number;
        columnSpan: number;
      };
    }>;
  }>;

  tabbedDashboardDefinitions: Array<{
    name: string;
    title: string;
    navbar: Navbar;
  }>;
};

export type Navbar = { label: string; path: string; view: string };
