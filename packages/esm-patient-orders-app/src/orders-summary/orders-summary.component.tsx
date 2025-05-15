import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ConfigObject, useConfig } from '@openmrs/esm-framework';
import OrderDetailsTable from '../components/order-details-table.component';

export interface OrdersSummaryProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const OrdersSummary: React.FC<OrdersSummaryProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const { showPrintButton } = useConfig<ConfigObject>();
  const ordersDisplayText = t('orders', 'Orders');

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <OrderDetailsTable
        patientUuid={patientUuid}
        patient={patient}
        showAddButton
        showPrintButton={showPrintButton}
        title={ordersDisplayText}
      />
    </div>
  );
};

export default OrdersSummary;
