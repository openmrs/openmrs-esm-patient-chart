import React from 'react';
import FloatingOrderBasketButton from './floating-order-basket-button.component';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { DataTableSkeleton } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { usePatientOrders } from '../api/api';

export interface MedicationsSummaryProps {
  patientUuid: string;
}

export default function MedicationsSummary({ patientUuid }: MedicationsSummaryProps) {
  const { t } = useTranslation();

  const {
    data: activeOrders,
    isError: isErrorActiveOrders,
    isLoading: isLoadingActiveOrders,
    isValidating: isValidatingActiveOrders,
  } = usePatientOrders(patientUuid, 'ACTIVE');
  const {
    data: pastOrders,
    isError: isErrorPastOrders,
    isLoading: isLoadingPastOrders,
    isValidating: isValidatingPastOrders,
  } = usePatientOrders(patientUuid, 'any');

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        {(() => {
          const displayText = t('activeMedications', 'Active medications');
          const headerTitle = t('activeMedications', 'active medications');

          if (isLoadingActiveOrders) return <DataTableSkeleton role="progressbar" />;
          if (isErrorActiveOrders) return <ErrorState error={isErrorActiveOrders} headerTitle={headerTitle} />;
          if (activeOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidatingActiveOrders}
                title={t('activeMedications', 'Active Medications')}
                medications={activeOrders}
                showDiscontinueButton={true}
                showModifyButton={true}
                showReorderButton={false}
                showAddNewButton={false}
              />
            );
          }
          return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
        })()}
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        {(() => {
          const displayText = t('pastMedications', 'Past medications');
          const headerTitle = t('pastMedications', 'past medications');

          if (isLoadingPastOrders) return <DataTableSkeleton role="progressbar" />;
          if (isErrorPastOrders) return <ErrorState error={isErrorPastOrders} headerTitle={headerTitle} />;
          if (pastOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidatingPastOrders}
                title={t('pastMedications', 'Past Medications')}
                medications={pastOrders}
                showDiscontinueButton={true}
                showModifyButton={true}
                showReorderButton={false}
                showAddNewButton={false}
              />
            );
          }
          return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
        })()}
      </div>
      <FloatingOrderBasketButton />
    </>
  );
}
