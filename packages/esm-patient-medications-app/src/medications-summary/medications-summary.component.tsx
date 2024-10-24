import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { usePatientOrders } from '../api';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { type AddDrugOrderWorkspaceAdditionalProps } from '../add-drug-order/add-drug-order.workspace';

export interface MedicationsSummaryProps {
  patient: fhir.Patient;
}

export default function MedicationsSummary({ patient }: MedicationsSummaryProps) {
  const { t } = useTranslation();
  const launchAddDrugWorkspace =
    useLaunchWorkspaceRequiringVisit<AddDrugOrderWorkspaceAdditionalProps>('add-drug-order');

  const { data: allOrders, error, isLoading, isValidating } = usePatientOrders(patient?.id);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        {(() => {
          const displayText = t('activeMedicationsDisplayText', 'Active medications');
          const headerTitle = t('activeMedicationsHeaderTitle', 'Active medications');

          if (isLoading) return <DataTableSkeleton role="progressbar" />;

          if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

          if (allOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidating}
                title={t('activeMedicationsTableTitle', 'Active Medications')}
                medications={allOrders} // Use allOrders directly
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
          const headerTitle = t('pastMedicationsHeaderTitle', 'Past medications');

          if (isLoading) return <DataTableSkeleton role="progressbar" />;

          if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

          if (allOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidating}
                title={t('pastMedicationsTableTitle', 'Past Medications')}
                medications={allOrders} // Use allOrders directly
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
