import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit, type Order } from '@openmrs/esm-patient-common-lib';
import { useActivePatientOrders, usePastPatientOrders } from '../api';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { type AddDrugOrderWorkspaceAdditionalProps } from '../add-drug-order/add-drug-order.workspace';

export interface MedicationsSummaryProps {
  patient: fhir.Patient;
}

export default function MedicationsSummary({ patient }: MedicationsSummaryProps) {
  const { t } = useTranslation();
  const launchAddDrugWorkspace =
    useLaunchWorkspaceRequiringVisit<AddDrugOrderWorkspaceAdditionalProps>('add-drug-order');

  const {
    data: activeOrders,
    error: activeOrdersError,
    isLoading: isActiveLoading,
    isValidating: isActiveValidating,
  } = useActivePatientOrders(patient?.id);

  const {
    data: pastOrders,
    error: pastOrdersError,
    isLoading: isPastLoading,
    isValidating: isPastValidating,
  } = usePastPatientOrders(patient?.id);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        {(() => {
          const displayText = t('activeMedicationsDisplayText', 'Active medications');
          const headerTitle = t('activeMedicationsHeaderTitle', 'Active Medications');

          if (isActiveLoading) return <DataTableSkeleton role="progressbar" />;

          if (activeOrdersError) return <ErrorState error={activeOrdersError} headerTitle={headerTitle} />;

          if (activeOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isActiveValidating}
                title={t('activeMedicationsTableTitle', 'Active Medications')}
                medications={activeOrders}
                showDiscontinueButton={true}
                showModifyButton={true}
                showReorderButton={false}
                patient={patient}
              />
            );
          }

          return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchAddDrugWorkspace} />;
        })()}
      </div>
      <div>
        {(() => {
          const displayText = t('pastMedicationsDisplayText', 'Past medications');
          const headerTitle = t('pastMedicationsHeaderTitle', 'Past Medications');

          if (isPastLoading) return <DataTableSkeleton role="progressbar" />;

          if (pastOrdersError) return <ErrorState error={pastOrdersError} headerTitle={headerTitle} />;

          if (pastOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isPastValidating}
                title={t('pastMedicationsTableTitle', 'Past Medications')}
                medications={pastOrders}
                showDiscontinueButton={false}
                showModifyButton={false}
                showReorderButton={true}
                patient={patient}
              />
            );
          }

          return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
        })()}
      </div>
    </div>
  );
}
