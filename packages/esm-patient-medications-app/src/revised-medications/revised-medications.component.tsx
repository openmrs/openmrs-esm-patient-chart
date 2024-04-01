import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { usePatientOrders } from '../api/api';

interface RevisedMedicationsProps {
  patientUuid: string;
}

const RevisedMedications: React.FC<RevisedMedicationsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const displayText = t('revisedMedicationsDisplayText', 'Revised medications');
  const headerTitle = t('revisedMedicationsHeaderTitle', 'revised medications');

  const { data: patientOrders, error, isLoading, isValidating } = usePatientOrders(patientUuid, 'any');

  const revisedPatientOrders = patientOrders?.filter((order) => order.action == 'REVISE');

  const launchAddDrugWorkspace = useLaunchWorkspaceRequiringVisit('add-drug-order');

  if (isLoading) return <DataTableSkeleton role="progressbar" />;

  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

  if (revisedPatientOrders?.length) {
    return (
      <MedicationsDetailsTable
        isValidating={isValidating}
        title={t('revisedMedicationsTableTitle', 'Revised Medications')}
        medications={revisedPatientOrders}
        showDiscontinueButton={true}
        showModifyButton={true}
        showReorderButton={false}
        patientUuid={patientUuid}
      />
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
};

export default RevisedMedications;
