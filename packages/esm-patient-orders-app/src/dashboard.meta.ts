import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const ordersDashboardMeta: DashboardLinkConfig & { slot: string; hideDashboardTitle: boolean } = {
  slot: 'patient-chart-lab-orders-dashboard-slot',
  path: 'orders',
  title: 'Orders',
  icon: 'omrs-icon-shopping-cart',
  hideDashboardTitle: true,
};
