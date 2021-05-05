export interface DashbardGridConfig {
  columns: number;
  type: 'grid';
}

export interface DashboardTabConfig {
  type: 'tabs';
}

export interface DashboardLinkConfig {
  name: string;
  title: string;
}

export interface DashboardConfig extends DashboardLinkConfig {
  slot: string;
  config: DashbardGridConfig | DashboardTabConfig;
}
