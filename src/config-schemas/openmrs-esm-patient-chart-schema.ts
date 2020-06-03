import { validators } from "@openmrs/esm-module-config";
import {
  coreWidgetDefinitions,
  coreDashboardDefinitions,
  coreTabbedViewDefinitions
} from "../view-components/core-views";

import {
  widgetCommonConfigSchema,
  WidgetCommonConfig,
  ExternalPatientChartConfigs
} from "@openmrs/esm-patient-chart-widgets";

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
  },
  externalPatientChartConfigs: {
    dictionaryElements: {
      skipValidations: true
    }
  },
  widgetCommonConfig: {
    ...widgetCommonConfigSchema
  }
};

export type ChartConfig = {
  primaryNavbar: Navbar[];
  widgetDefinitions: {
    name: string;
    esModule?: string;
    label?: string;
    path?: string;
  };

  dashboardDefinitions: {
    name: string;
    title: string;
    layout: { columns: number };
    widgets: {
      name: string;
      esModule: string;
      label: string;
      path: string;
      layout: {
        rowSpan: number;
        columnSpan: number;
      };
    }[];
  };

  tabbedDashboardDefinitions: {
    name: string;
    title: string;
    navbar: Navbar;
  }[];
  externalPatientChartConfigs: ExternalPatientChartConfigs;
  widgetCommonConfig: WidgetCommonConfig;
};

export type Navbar = { label: string; path: string; view: string };
