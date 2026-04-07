import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { useActivePatientOrders, usePastPatientOrders } from '../api';
import { type AddDrugOrderWorkspaceProps } from '../add-drug-order/add-drug-order.workspace';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import styles from './medications-summary.scss';

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
    data: activeOrders,
    error: activeOrdersError,
    isLoading: isLoadingActiveOrders,
    isValidating: isValidatingActiveOrders,
  } = useActivePatientOrders(patient.id);

  const {
    data: pastOrders,
    error: pastOrdersError,
    isLoading: isLoadingPastOrders,
    isValidating: isValidatingPastOrders,
  } = usePastPatientOrders(patient.id);

  const activeHeaderTitle = t('activeMedicationsHeaderTitle', 'Active medications');
  const activeDisplayText = t('activeMedicationsDisplayText', 'active medications');
  const pastHeaderTitle = t('pastMedicationsHeaderTitle', 'Past medications');
  const pastDisplayText = t('pastMedicationsDisplayText', 'past medications');

  return (
    <div>
      <section className={styles.medicationsSummaryContainer}>
        {isLoadingActiveOrders ? (
          <DataTableSkeleton role="progressbar" />
        ) : activeOrdersError ? (
          <ErrorState error={activeOrdersError} headerTitle={activeHeaderTitle} />
        ) : activeOrders?.length ? (
          <MedicationsDetailsTable
            isValidating={isValidatingActiveOrders}
            title={t('activeMedicationsTableTitle', 'Active Medications')}
            medications={activeOrders}
            showAddButton={true}
            showDiscontinueButton={true}
            showModifyButton={true}
            showRenewButton={true}
            patient={patient}
          />
        ) : (
          <EmptyState
            displayText={activeDisplayText}
            headerTitle={activeHeaderTitle}
            launchForm={launchAddDrugWorkspace}
          />
        )}
      </section>
      <section>
        {isLoadingPastOrders ? (
          <DataTableSkeleton role="progressbar" />
        ) : pastOrdersError ? (
          <ErrorState error={pastOrdersError} headerTitle={pastHeaderTitle} />
        ) : pastOrders?.length ? (
          <MedicationsDetailsTable
            isValidating={isValidatingPastOrders}
            title={t('pastMedicationsTableTitle', 'Past Medications')}
            medications={pastOrders}
            showAddButton={false}
            showDiscontinueButton={false}
            showModifyButton={false}
            showRenewButton={true}
            patient={patient}
          />
        ) : (
          <EmptyState displayText={pastDisplayText} headerTitle={pastHeaderTitle} />
        )}
      </section>
    </div>
  );
}
