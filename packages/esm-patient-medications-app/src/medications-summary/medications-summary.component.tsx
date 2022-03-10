import React from 'react';
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
          const displayText = t('activeMedicationsDisplayText', 'Active medications');
          const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');

          if (isLoadingActiveOrders) return <DataTableSkeleton role="progressbar" />;
          if (isErrorActiveOrders) return <ErrorState error={isErrorActiveOrders} headerTitle={headerTitle} />;
          if (activeOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidatingActiveOrders}
                title={t('activeMedicationsTableTitle', 'Active Medications')}
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
          const displayText = t('pastMedicationsDisplayText', 'Past medications');
          const headerTitle = t('pastMedicationsHeaderTitle', 'past medications');

          if (isLoadingPastOrders) return <DataTableSkeleton role="progressbar" />;
          if (isErrorPastOrders) return <ErrorState error={isErrorPastOrders} headerTitle={headerTitle} />;
          if (pastOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidatingPastOrders}
                title={t('pastMedicationsTableTitle', 'Past Medications')}
                medications={pastOrders}
                showDiscontinueButton={true}
                showModifyButton={true}
                showReorderButton={true}
                showAddNewButton={false}
              />
            );
          }
          return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
        })()}
      </div>
    </>
  );
}
