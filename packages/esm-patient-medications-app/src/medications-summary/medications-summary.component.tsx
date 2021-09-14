import React from 'react';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import FloatingOrderBasketButton from './floating-order-basket-button.component';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { useTranslation } from 'react-i18next';
import { usePatientOrders } from '../utils/use-current-patient-orders.hook';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

export interface MedicationsSummaryProps {
  patientUuid: string;
}

export default function MedicationsSummary({ patientUuid }: MedicationsSummaryProps) {
  const { t } = useTranslation();
  const [activePatientOrders] = usePatientOrders(patientUuid, 'ACTIVE');
  const [pastPatientOrders] = usePatientOrders(patientUuid, 'any');

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        {(() => {
          if (activePatientOrders && !activePatientOrders?.length)
            return (
              <EmptyState
                displayText={t('activeMedications', 'Active medications')}
                headerTitle={t('activeMedications', 'active medications')}
              />
            );
          if (activePatientOrders?.length) {
            return (
              <MedicationsDetailsTable
                title={t('activeMedications', 'Active Medications')}
                medications={activePatientOrders}
                showDiscontinueButton={true}
                showModifyButton={true}
                showReorderButton={false}
                showAddNewButton={false}
              />
            );
          }
          return <DataTableSkeleton />;
        })()}
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        {(() => {
          if (pastPatientOrders && !pastPatientOrders?.length)
            return (
              <EmptyState
                displayText={t('pastMedications', 'Past medications')}
                headerTitle={t('pastMedications', 'past medications')}
              />
            );
          if (pastPatientOrders?.length) {
            return (
              <MedicationsDetailsTable
                title={t('pastMedications', 'Past Medications')}
                medications={pastPatientOrders}
                showDiscontinueButton={false}
                showModifyButton={false}
                showReorderButton={true}
                showAddNewButton={false}
              />
            );
          }
          return <DataTableSkeleton />;
        })()}
      </div>
      <FloatingOrderBasketButton />
    </>
  );
}
