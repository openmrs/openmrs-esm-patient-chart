import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { useActivePatientOrders } from '../api/api';

interface ActiveMedicationsProps {
  patient: fhir.Patient;
}

const ActiveMedications: React.FC<ActiveMedicationsProps> = ({ patient }) => {
  const { t } = useTranslation();
  const displayText = t('activeMedicationsDisplayText', 'Active medications');
  const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');

  const { data: activePatientOrders, error, isLoading, isValidating } = useActivePatientOrders(patient?.id);

  const launchAddDrugWorkspace = useLaunchWorkspaceRequiringVisit('add-drug-order');

  if (isLoading) return <DataTableSkeleton role="progressbar" />;

  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

  if (activePatientOrders?.length) {
    return (
      <MedicationsDetailsTable
        isValidating={isValidating}
        title={t('activeMedicationsTableTitle', 'Active Medications')}
        medications={activePatientOrders}
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
