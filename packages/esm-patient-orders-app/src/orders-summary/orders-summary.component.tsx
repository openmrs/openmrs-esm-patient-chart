import React from 'react';
import { useTranslation } from 'react-i18next';
import OrderDetailsTable from '../components/orders-details-table.component';

export interface OrdersSummaryProps {
  patientUuid: string;
}

const OrdersSummary: React.FC<OrdersSummaryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const ordersDisplayText = t('orders', 'Orders');

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <OrderDetailsTable
        title={ordersDisplayText}
        patientUuid={patientUuid}
        showAddButton={true}
        showPrintButton={false}
      />
    </div>
  );
};

export default OrdersSummary;
