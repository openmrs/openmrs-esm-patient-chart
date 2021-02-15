import { Type } from "@openmrs/esm-framework";
import {
  coreWidgetDefinitions,
  coreDashboardDefinitions,
  coreTabbedViewDefinitions
} from "../view-components/core-views";

export const esmPatientChartSchema = {
  primaryNavbar: {
    _type: Type.Array,
    _elements: {
      label: { _type: Type.String },
      path: { _type: Type.String },
      view: { _type: Type.String }
    },
    _default: [
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
        view: "MedicationsOverview"
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
    _type: Type.Array,
    _elements: {
      name: { _type: Type.String },
      extensionSlotName: {
        _default: undefined,
        _type: Type.String
      },
      props: { _default: {}, _type: Type.Object },
      config: { _default: {}, _type: Type.Object }
    },
    _default: coreWidgetDefinitions
  },

  dashboardDefinitions: {
    _type: Type.Array,
    _elements: {
      name: { _type: Type.String },
      title: { _type: Type.String },
      layout: {
        columns: {}
      },
      widgets: {
        _type: Type.Array,
        _elements: {
          name: { _type: Type.String },
          extensionSlotName: {
            _default: undefined,
            _type: Type.String
          },
          props: { _default: {}, _type: Type.Object },
          config: { _default: {}, _type: Type.Object },
          layout: {
            rowSpan: {},
            columnSpan: {}
          }
        }
      }
    },
    _default: coreDashboardDefinitions
  },

  tabbedViewDefinitions: {
    _type: Type.Array,
    _elements: {
      name: { _type: Type.String },
      title: { _type: Type.String },
      navbar: {
        _type: Type.Array,
        _elements: {
          label: { _type: Type.String },
          path: { _type: Type.String },
          view: { _type: Type.String }
        }
      }
    },
    _default: coreTabbedViewDefinitions
  }
};

export interface ChartConfig {
  primaryNavbar: Array<Navbar>;

  widgetDefinitions: Array<{
    name: string;
    extensionSlotName: string;
    props?: any;
    config?: any;
  }>;

  dashboardDefinitions: Array<{
    name: string;
    title: string;
    layout: { columns: number };
    widgets: Array<{
      name: string;
      extensionSlotName: string;
      props?: any;
      config?: any;
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
}

export interface Navbar {
  label: string;
  path: string;
  view: string;
}
