import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { usePatientOrders } from '../api/api';

interface ActiveMedicationsProps {
  patient: fhir.Patient | null;
}

const ActiveMedications: React.FC<ActiveMedicationsProps> = ({ patient }) => {
  const { t } = useTranslation();
  const displayText = t('activeMedicationsDisplayText', 'Active medication');
  const headerTitle = t('activeMedicationsHeaderTitle', 'Active Medication');

  const { data: activePatientOrders, error, isLoading, isValidating } = usePatientOrders(patient?.id);

  const launchAddDrugWorkspace = useLaunchWorkspaceRequiringVisit('add-drug-order');

  if (isLoading) return <DataTableSkeleton role="progressbar" />;

  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

  const activeMedications = activePatientOrders?.filter((order) => {
    const isActive = !order.dateStopped && order.action !== 'DISCONTINUE';
    return isActive || (!order.autoExpireDate && order.action !== 'DISCONTINUE');
  });

  if (activeMedications?.length) {
    return (
      <MedicationsDetailsTable
        isValidating={isValidating}
        title={t('activeMedicationsTableTitle', 'Active Medication')}
        medications={activeMedications}
        showDiscontinueButton={true}
        showModifyButton={true}
        showReorderButton={false}
        patient={patient}
      />
    );
  }

  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={() => launchAddDrugWorkspace()} />;
};

export default ActiveMedications;
