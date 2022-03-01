import React from 'react';
import FloatingOrderBasketButton from './floating-order-basket-button.component';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { DataTableSkeleton } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { usePagination } from '@openmrs/esm-framework';
import { EmptyState, ErrorState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { usePatientOrders } from '../api/api';
import styles from './medications-summary.scss';

export interface MedicationsSummaryProps {
  patientUuid: string;
}

export default function MedicationsSummary({ patientUuid }: MedicationsSummaryProps) {
  const orderCount = 5;
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

  const {
    results: paginatedActiveOrders,
    goTo: goToActiveOrdersPage,
    currentPage: currentPageActiveOrders,
  } = usePagination(activeOrders ?? [], orderCount);

  const {
    results: paginatedPastOrders,
    goTo: goToPastOrdersPage,
    currentPage: currentPagePastOrders,
  } = usePagination(pastOrders ?? [], orderCount);

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
              <>
                <MedicationsDetailsTable
                  isValidating={isValidatingActiveOrders}
                  title={t('activeMedications', 'Active Medications')}
                  medications={paginatedActiveOrders}
                  showDiscontinueButton={true}
                  showModifyButton={true}
                  showReorderButton={false}
                  showAddNewButton={false}
                />
                <div className={styles.paginationContainer}>
                  <PatientChartPagination
                    currentItems={paginatedActiveOrders.length}
                    onPageNumberChange={({ page }) => goToActiveOrdersPage(page)}
                    pageNumber={currentPageActiveOrders}
                    pageSize={orderCount}
                    totalItems={activeOrders.length}
                  />
                </div>
              </>
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
              <>
                <MedicationsDetailsTable
                  isValidating={isValidatingPastOrders}
                  title={t('pastMedications', 'Past Medications')}
                  medications={paginatedPastOrders}
                  showDiscontinueButton={true}
                  showModifyButton={true}
                  showReorderButton={false}
                  showAddNewButton={false}
                />
                <div className={styles.paginationContainer}>
                  <PatientChartPagination
                    currentItems={paginatedPastOrders.length}
                    onPageNumberChange={({ page }) => goToPastOrdersPage(page)}
                    pageNumber={currentPagePastOrders}
                    pageSize={orderCount}
                    totalItems={pastOrders.length}
                  />
                </div>
              </>
            );
          }
          return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
        })()}
      </div>
      <FloatingOrderBasketButton />
    </>
  );
}
