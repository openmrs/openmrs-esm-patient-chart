import { defineConfigSchema, validators } from "@openmrs/esm-module-config";

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
        view: "conditionsOverview"
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
          label: { validators: [validators.isString] },
          path: { validators: [validators.isString] },
          layout: {
            rowSpan: {},
            columnSpan: {}
          }
        }
      }
    },
    default: [
      {
        name: "summaryDashboard",
        title: "Overview",
        layout: {
          columns: 4
        },
        widgets: [
          {
            name: "ConditionsOverview",
            esModule: "@openmrs/esm-patient-chart-widgets",
            layout: { columnSpan: 2 }
          },
          {
            name: "ProgramsOverview",
            esModule: "@openmrs/esm-patient-chart-widgets",
            layout: { columnSpan: 2 }
          },
          {
            name: "NotesOverview",
            esModule: "@openmrs/esm-patient-chart-widgets",
            layout: { columnSpan: 4 }
          },
          {
            name: "VitalsOverview",
            esModule: "@openmrs/esm-patient-chart-widgets",
            layout: { columnSpan: 2 }
          },
          {
            name: "HeightAndWeightOverview",
            esModule: "@openmrs/esm-patient-chart-widgets",
            layout: { columnSpan: 2 }
          },
          {
            name: "MedicationsOverview",
            esModule: "@openmrs/esm-patient-chart-widgets",
            layout: { columnSpan: 3 }
          },
          {
            name: "AllergiesOverview",
            esModule: "@openmrs/esm-patient-chart-widgets",
            layout: { columnSpan: 1 }
          },
          {
            name: "AppointmentsOverview",
            esModule: "@openmrs/esm-patient-chart-widgets",
            layout: { columnSpan: 4 }
          }
        ]
      },

      {
        name: "resultsOverviewDashboard",
        layout: { columns: 1 },
        widgets: [
          {
            name: "VitalsOverview",
            esModule: "@openmrs/esm-patient-chart-widgets"
          },
          {
            name: "HeightAndWeightOverview",
            esModule: "@openmrs/esm-patient-chart-widgets"
          }
        ]
      },

      {
        name: "ordersOverviewDashboard",
        title: "Orders Overview",
        layout: { columns: 1 },
        widgets: [
          {
            name: "MedicationsOverview",
            esModule: "@openmrs/esm-patient-chart-widgets"
          }
        ]
      },

      {
        name: "encountersOverviewDashboard",
        widgets: [
          {
            name: "NotesOverview",
            esModule: "@openmrs/esm-patient-chart-widgets"
          }
        ]
      },

      {
        name: "conditionsOverviewDashboard",
        widgets: [
          {
            name: "ConditionsOverview",
            esModule: "@openmrs/esm-patient-chart-widgets"
          }
        ]
      },

      {
        name: "allergiesOverviewDashboard",
        widgets: [
          {
            name: "AllergiesOverview",
            esModule: "@openmrs/esm-patient-chart-widgets"
          }
        ]
      },

      {
        name: "programsOverviewDashboard",
        widgets: [
          {
            name: "ProgramsOverview",
            esModule: "@openmrs/esm-patient-chart-widgets"
          }
        ]
      },

      {
        name: "appointmentsOverviewDashboard",
        widgets: [
          {
            name: "AppointmentsOverview",
            esModule: "@openmrs/esm-patient-chart-widgets"
          }
        ]
      }
    ]
  },

  widgetDefinitions: {
    arrayElements: {
      name: { validators: [validators.isString] },
      esModule: { validators: [validators.isString] },
      label: { validators: [validators.isString] },
      path: { validators: [validators.isString] }
    },
    default: [
      {
        name: "ProgramsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets"
      },

      {
        name: "MedicationsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets"
      },

      {
        name: "MedicationsSummary",
        esModule: "@openmrs/esm-patient-chart-widgets"
      },

      {
        name: "HeightAndWeightOverview",
        esModule: "@openmrs/esm-patient-chart-widgets"
      },

      {
        name: "HeightAndWeightSummary",
        esModule: "@openmrs/esm-patient-chart-widgets"
      },

      {
        name: "VitalsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets"
      },

      {
        name: "VitalsSummary",
        esModule: "@openmrs/esm-patient-chart-widgets"
      },

      {
        name: "ConditionsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets"
      },

      {
        name: "AllergiesOverview",
        esModule: "@openmrs/esm-patient-chart-widgets"
      },

      {
        name: "NotesOverview",
        esModule: "@openmrs/esm-patient-chart-widgets"
      },

      {
        name: "AppointmentsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets"
      }
    ]
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
    default: [
      {
        name: "resultsTabbedView",
        title: "Results",

        navbar: [
          {
            label: "Overview",
            path: "/overview",
            view: "resultsOverviewDashboard"
          },
          {
            label: "Vitals",
            path: "/vitals",
            view: "VitalsSummary"
          },
          {
            label: "Height and Weight",
            path: "/heightAndWeight",
            view: "HeightAndWeightSummary"
          }
        ]
      },

      {
        name: "ordersTabbedView",
        title: "Orders",

        navbar: [
          {
            label: "Overview",
            path: "/overview",
            view: "ordersOverviewDashboard"
          },
          {
            label: "Medication Orders",
            path: "/medication-orders",
            view: "MedicationsSummary"
          }
        ]
      }
    ]
  }
};
