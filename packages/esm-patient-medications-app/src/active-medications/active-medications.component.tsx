import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { usePatientOrders } from '../api/api';

interface ActiveMedicationsProps {
  patient: fhir.Patient;
}

const ActiveMedications: React.FC<ActiveMedicationsProps> = ({ patient }) => {
  const { t } = useTranslation();
  const displayText = t('activeMedicationsDisplayText', 'Active medications');
  const headerTitle = t('activeMedicationsHeaderTitle', 'Active Medications');

  const { data: activePatientOrders, error, isLoading, isValidating } = usePatientOrders(patient?.id);

  const launchAddDrugWorkspace = useLaunchWorkspaceRequiringVisit('add-drug-order');

  if (isLoading) return <DataTableSkeleton role="progressbar" />;

  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

  const activeMedications = activePatientOrders?.filter((order) => {
    const isDateStoppedUnset = !order.dateStopped;
    const isActionValid = order.action !== 'DISCONTINUE';
    const isAutoExpireDateValid = !order.autoExpireDate || new Date(order.autoExpireDate) > new Date();

    return isDateStoppedUnset && isActionValid && isAutoExpireDateValid;
  });

  if (activeMedications?.length) {
    return (
      <MedicationsDetailsTable
        isValidating={isValidating}
        title={t('activeMedicationsTableTitle', 'Active Medications')}
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
