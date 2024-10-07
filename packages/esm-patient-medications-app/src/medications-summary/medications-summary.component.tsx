import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { parseDate } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit, type Order } from '@openmrs/esm-patient-common-lib';
import { usePatientOrders } from '../api';
import { type AddDrugOrderWorkspaceAdditionalProps } from '../add-drug-order/add-drug-order.workspace';
import MedicationsDisplaySection from './medications-display-section.component';

export interface MedicationsSummaryProps {
  patient: fhir.Patient;
}

export default function MedicationsSummary({ patient }: MedicationsSummaryProps) {
  const { t } = useTranslation();
  const launchAddDrugWorkspace =
    useLaunchWorkspaceRequiringVisit<AddDrugOrderWorkspaceAdditionalProps>('add-drug-order');

  const { data: allOrders, error, isLoading, isValidating } = usePatientOrders(patient?.id, 'any');

  const [pastOrders, activeOrders] = useMemo(() => {
    if (!allOrders) {
      return [[], []];
    }

    const currentDate = new Date();
    const pastOrders: Array<Order> = [];
    const activeOrders: Array<Order> = [];

    for (const order of allOrders) {
      const isExpired = order.autoExpireDate && parseDate(order.autoExpireDate) < currentDate;
      const isStopped = order.dateStopped && parseDate(order.dateStopped) < currentDate;

      if (isExpired || isStopped) {
        pastOrders.push(order);
      } else {
        activeOrders.push(order);
      }
    }

    return [pastOrders, activeOrders];
  }, [allOrders]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <MedicationsDisplaySection
          displayText={t('activeMedicationsDisplayText', 'Active medications')}
          error={error}
          headerTitle={t('activeMedicationsHeaderTitle', 'active medications')}
          isLoading={isLoading}
          isValidating={isValidating}
          launchAddDrugWorkspace={launchAddDrugWorkspace}
          orders={activeOrders}
          patient={patient}
          type="active"
        />
      </div>
      <div>
        <MedicationsDisplaySection
          displayText={t('pastMedicationsDisplayText', 'Past medications')}
          error={error}
          headerTitle={t('pastMedicationsHeaderTitle', 'past medications')}
          isLoading={isLoading}
          isValidating={isValidating}
          launchAddDrugWorkspace={launchAddDrugWorkspace}
          orders={pastOrders}
          patient={patient}
          type="past"
        />
      </div>
    </div>
  );
}
