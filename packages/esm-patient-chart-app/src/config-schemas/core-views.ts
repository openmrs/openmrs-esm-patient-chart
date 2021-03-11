export interface DashbardLayoutConfig {
  columns: number;
}

export interface DashboardConfig {
  name: string;
  slot: string;
  layout: DashbardLayoutConfig;
}

export const defaultDashboardDefinitions: Array<DashboardConfig> = [
  {
    name: "summary",
    slot: "patient-chart-summary-dashboard-slot",
    layout: { columns: 4 }
  },
  {
    name: "results",
    slot: "patient-chart-results-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "orders",
    slot: "patient-chart-orders-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "notes",
    slot: "patient-chart-notes-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "conditions",
    slot: "patient-chart-conditions-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "immunizations",
    slot: "patient-chart-immunization-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "allergies",
    slot: "patient-chart-allergies-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "programs",
    slot: "patient-chart-programs-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "appointments",
    slot: "patient-chart-appointments-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "attachments",
    slot: "patient-chart-attachments-dashboard-slot",
    layout: { columns: 1 }
  }
];
