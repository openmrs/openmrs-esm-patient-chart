import React from 'react';
import { useTranslation } from 'react-i18next';
import OrderDetailsTable from '../components/orders-details-table.component';
import { type ConfigObject, useConfig } from '@openmrs/esm-framework';

export interface OrdersSummaryProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const OrdersSummary: React.FC<OrdersSummaryProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const ordersDisplayText = t('orders', 'Orders');
  const { showPrintButton } = useConfig<ConfigObject>();

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
