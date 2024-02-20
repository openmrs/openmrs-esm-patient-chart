import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { usePatientOrders } from '../api/api';

interface ActiveMedicationsProps {
  patientUuid: string;
}

const ActiveMedications: React.FC<ActiveMedicationsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const displayText = t('activeMedicationsDisplayText', 'Active medications');
  const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');

  const { data: activePatientOrders, error, isLoading, isValidating } = usePatientOrders(patientUuid, 'ACTIVE');
  const launchAddDrugWorkspace = useLaunchWorkspaceRequiringVisit('add-drug-order');

  const renderSkeleton = () => <DataTableSkeleton role="progressbar" />;
  const renderErrorState = () => <ErrorState error={error} headerTitle={headerTitle} />;
  const renderMedicationsTable = () => (
    <MedicationsDetailsTable
      isValidating={isValidating}
      title={t('activeMedicationsTableTitle', 'Active Medications')}
      medications={activePatientOrders}
      showDiscontinueButton={true}
      showModifyButton={true}
      showReorderButton={false}
      patientUuid={patientUuid}
    />
  );
  const renderEmptyState = () => (
    <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={() => launchAddDrugWorkspace()} />
  );

  return isLoading
    ? renderSkeleton()
    : error
    ? renderErrorState()
    : activePatientOrders?.length
    ? renderMedicationsTable()
    : renderEmptyState();
};

export default ActiveMedications;
