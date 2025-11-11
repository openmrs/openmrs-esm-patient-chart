import { type OrderBasketWindowProps } from './types';

export const patientChartOrderBasketWindowProps: Omit<OrderBasketWindowProps, 'encounterUuid'> = {
  orderBasketWorkspaceName: 'order-basket',
  drugOrderWorkspaceName: 'add-drug-order',
  generalOrderWorkspaceName: 'orderable-concept-workspace',
  labOrderWorkspaceName: 'add-lab-order',
  cancelOrderWorkspaceName: 'patient-orders-form-workspace',
};
