export interface DashbardGridConfig {
  columns: number;
  type: "grid";
}

export interface DashboardTabConfig {
  type: "tabs";
}

export type DashbardLayoutConfig = DashbardGridConfig | DashboardTabConfig;

export interface DashboardConfig {
  name: string;
  slot: string;
  config: DashbardLayoutConfig;
}

export const defaultDashboardDefinitions: Array<DashboardConfig> = [
  {
    name: "summary",
    slot: "patient-chart-summary-dashboard-slot",
    config: { columns: 4, type: "grid" },
  },
  {
    name: "results",
    slot: "patient-chart-results-dashboard-slot",
    config: { type: "tabs" },
  },
  {
    name: "orders",
    slot: "patient-chart-orders-dashboard-slot",
    config: { columns: 1, type: "grid" },
  },
  {
    name: "notes",
    slot: "patient-chart-notes-dashboard-slot",
    config: { type: "tabs" },
  },
  {
    name: "conditions",
    slot: "patient-chart-conditions-dashboard-slot",
    config: { columns: 1, type: "grid" },
  },
  {
    name: "immunizations",
    slot: "patient-chart-immunization-dashboard-slot",
    config: { columns: 1, type: "grid" },
  },
  {
    name: "allergies",
    slot: "patient-chart-allergies-dashboard-slot",
    config: { columns: 1, type: "grid" },
  },
  {
    name: "programs",
    slot: "patient-chart-programs-dashboard-slot",
    config: { columns: 1, type: "grid" },
  },
  {
    name: "appointments",
    slot: "patient-chart-appointments-dashboard-slot",
    config: { columns: 1, type: "grid" },
  },
  {
    name: "attachments",
    slot: "patient-chart-attachments-dashboard-slot",
    config: { columns: 1, type: "grid" },
  },
];
