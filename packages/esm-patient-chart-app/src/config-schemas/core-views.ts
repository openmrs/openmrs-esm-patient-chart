export interface DashbardGridConfig {
  columns: number;
  type: 'grid';
}

export interface DashboardTabConfig {
  type: 'tabs';
}

export type DashbardLayoutConfig = DashbardGridConfig | DashboardTabConfig;

export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
  config: DashbardLayoutConfig;
}
