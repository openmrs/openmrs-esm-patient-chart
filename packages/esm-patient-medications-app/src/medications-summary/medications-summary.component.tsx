import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { usePatientOrders } from '../api';
import { type AddDrugOrderWorkspaceProps } from '../add-drug-order/add-drug-order.workspace';
import MedicationsDetailsTable from '../components/medications-details-table.component';

export interface MedicationsSummaryProps {
  patient: fhir.Patient;
}

export default function MedicationsSummary({ patient }: MedicationsSummaryProps) {
  const { t } = useTranslation();
  const launchAddDrugWorkspace = useLaunchWorkspaceRequiringVisit<AddDrugOrderWorkspaceProps>(
    patient.id,
    'add-drug-order',
  );

  const {
    futureOrders,
    activeOrders,
    pastOrders,
    error: ordersError,
    isLoading: isLoadingOrders,
    isValidating: isValidatingOrders,
  } = usePatientOrders(patient?.id);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        {(() => {
          const headerTitle = t('futureMedicationsHeaderTitle', 'Future medications');
          const displayText = t('futureMedicationsDisplayText', 'future medications');

          if (isLoadingOrders) return <DataTableSkeleton role="progressbar" />;

          if (ordersError) return <ErrorState error={ordersError} headerTitle={headerTitle} />;

          if (futureOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidatingOrders}
                title={t('futureMedicationsTableTitle', 'Future Medications')}
                medications={futureOrders}
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
      <div style={{ marginBottom: '1.5rem' }}>
        {(() => {
          const headerTitle = t('activeMedicationsHeaderTitle', 'Active medications');
          const displayText = t('activeMedicationsDisplayText', 'active medications');

          if (isLoadingOrders) return <DataTableSkeleton role="progressbar" />;

          if (ordersError) return <ErrorState error={ordersError} headerTitle={headerTitle} />;

          if (activeOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidatingOrders}
                title={t('activeMedicationsTableTitle', 'Active Medications')}
                medications={activeOrders}
                showDiscontinueButton={true}
                showModifyButton={true}
                showRenewButton={true}
                patient={patient}
              />
            );
          }

          return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchAddDrugWorkspace} />;
        })()}
      </div>
      <div>
        {(() => {
          const headerTitle = t('pastMedicationsHeaderTitle', 'Past medications');
          const displayText = t('pastMedicationsDisplayText', 'past medications');

          if (isLoadingOrders) return <DataTableSkeleton role="progressbar" />;

          if (ordersError) return <ErrorState error={ordersError} headerTitle={headerTitle} />;

          if (pastOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidatingOrders}
                title={t('pastMedicationsTableTitle', 'Past Medications')}
                medications={pastOrders}
                showAddButton={true}
                showDiscontinueButton={false}
                showModifyButton={false}
                showRenewButton={true}
                patient={patient}
              />
            );
          }

          return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchAddDrugWorkspace} />;
        })()}
      </div>
    </div>
  );
}
