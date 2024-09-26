import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { parseDate } from '@openmrs/esm-framework';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit, type Order } from '@openmrs/esm-patient-common-lib';
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

  const {
    data: allOrders,
    error: error,
    isLoading: isLoading,
    isValidating: isValidating,
  } = usePatientOrders(patient?.id, 'any');

  const [pastOrders, activeOrders] = useMemo(() => {
    const currentDate = new Date();
    const pastOrders: Array<Order> = [];
    const activeOrders: Array<Order> = [];

    if (allOrders) {
      for (let i = 0; i < allOrders.length; i++) {
        const order = allOrders[i];
        if (order.autoExpireDate && parseDate(order.autoExpireDate) < currentDate) {
          pastOrders.push(order);
        } else if (order.dateStopped && parseDate(order.dateStopped) < currentDate) {
          pastOrders.push(order);
        } else {
          activeOrders.push(order);
        }
      }
    }

    return [pastOrders, activeOrders];
  }, [allOrders]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        {(() => {
          const displayText = t('activeMedicationsDisplayText', 'Active medications');
          const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');

          if (isLoading) return <DataTableSkeleton role="progressbar" />;

          if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

          if (activeOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidating}
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

          if (isLoading) return <DataTableSkeleton role="progressbar" />;

          if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

          if (pastOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidating}
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
