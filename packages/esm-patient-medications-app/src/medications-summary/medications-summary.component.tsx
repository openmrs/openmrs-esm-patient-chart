import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { useActivePatientOrders, usePastPatientOrders } from '../api';
import { type AddDrugOrderWorkspaceAdditionalProps } from '../add-drug-order/add-drug-order.workspace';
import MedicationsDetailsTable from '../components/medications-details-table.component';

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
    isLoading: isLoadingActiveOrders,
    isValidating: isValidatingActiveOrders,
  } = useActivePatientOrders(patient?.id);

  const {
    data: pastOrders,
    error: pastOrdersError,
    isLoading: isLoadingPastOrders,
    isValidating: isValidatingPastOrders,
  } = usePastPatientOrders(patient?.id);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        {(() => {
          const displayText = t('activeMedicationsDisplayText', 'Active medications');
          const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');

          if (isLoadingActiveOrders) return <DataTableSkeleton role="progressbar" />;

          if (activeOrdersError) return <ErrorState error={activeOrdersError} headerTitle={headerTitle} />;

          if (activeOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidatingActiveOrders}
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
          const headerTitle = t('pastMedicationsHeaderTitle', 'past medications');

          if (isValidatingPastOrders) return <DataTableSkeleton role="progressbar" />;

          if (pastOrdersError) return <ErrorState error={pastOrdersError} headerTitle={headerTitle} />;

          if (pastOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidatingPastOrders}
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
