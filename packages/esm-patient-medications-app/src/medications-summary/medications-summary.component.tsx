import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, type Order, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { useMedicationOrders } from '../api';
import { type AddDrugOrderWorkspaceProps } from '../add-drug-order/add-drug-order.workspace';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import styles from './medications-summary.scss';

export interface MedicationsSummaryProps {
  patient: fhir.Patient;
}

interface MedicationsSectionProps {
  patient: fhir.Patient;
  orders: Order[];
  isLoading: boolean;
  isValidating: boolean;
  error: Error | undefined;
  launchAddDrugWorkspace: () => void;
  headerTitle: string;
  displayText: string;
  tableTitle: string;
  showDiscontinueButton: boolean;
  showModifyButton: boolean;
  showRenewButton: boolean;
  showAddButton?: boolean;
}

function MedicationsSection({
  patient,
  orders,
  isLoading,
  isValidating,
  error,
  launchAddDrugWorkspace,
  headerTitle,
  displayText,
  tableTitle,
  showDiscontinueButton,
  showModifyButton,
  showRenewButton,
  showAddButton,
}: MedicationsSectionProps) {
  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (orders.length) {
    return (
      <MedicationsDetailsTable
        isValidating={isValidating}
        title={tableTitle}
        medications={orders}
        showAddButton={showAddButton}
        showDiscontinueButton={showDiscontinueButton}
        showModifyButton={showModifyButton}
        showRenewButton={showRenewButton}
        patient={patient}
      />
    );
  }

  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchAddDrugWorkspace} />;
}

export default function MedicationsSummary({ patient }: MedicationsSummaryProps) {
  const { t } = useTranslation();
  const launchAddDrugWorkspace = useLaunchWorkspaceRequiringVisit<AddDrugOrderWorkspaceProps>(
    patient.id,
    'add-drug-order',
  );

  const { futureOrders, activeOrders, pastOrders, error, isLoading, isValidating } = useMedicationOrders(patient?.id);

  return (
    <>
      <section className={styles.medicationsSummaryContainer}>
        <MedicationsSection
          patient={patient}
          orders={activeOrders}
          isLoading={isLoading}
          isValidating={isValidating}
          error={error}
          launchAddDrugWorkspace={launchAddDrugWorkspace}
          headerTitle={t('activeMedicationsHeaderTitle', 'Active medications')}
          displayText={t('activeMedicationsDisplayText', 'active medications')}
          tableTitle={t('activeMedicationsTableTitle', 'Active Medications')}
          showDiscontinueButton
          showModifyButton
          showRenewButton
        />
      </section>
      <section className={styles.medicationsSummaryContainer}>
        <MedicationsSection
          patient={patient}
          orders={futureOrders}
          isLoading={isLoading}
          isValidating={isValidating}
          error={error}
          launchAddDrugWorkspace={launchAddDrugWorkspace}
          headerTitle={t('futureMedicationsHeaderTitle', 'Upcoming medications')}
          displayText={t('futureMedicationsDisplayText', 'upcoming medications')}
          tableTitle={t('futureMedicationsTableTitle', 'Upcoming Medications')}
          showDiscontinueButton
          showModifyButton
          showRenewButton={false}
        />
      </section>
      <section>
        <MedicationsSection
          patient={patient}
          orders={pastOrders}
          isLoading={isLoading}
          isValidating={isValidating}
          error={error}
          launchAddDrugWorkspace={launchAddDrugWorkspace}
          headerTitle={t('pastMedicationsHeaderTitle', 'Past medications')}
          displayText={t('pastMedicationsDisplayText', 'past medications')}
          tableTitle={t('pastMedicationsTableTitle', 'Past Medications')}
          showAddButton={false}
          showDiscontinueButton={false}
          showModifyButton={false}
          showRenewButton
        />
      </section>
    </>
  );
}
