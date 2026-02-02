import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { usePatientOrders } from '../api';

interface PastMedicationsProps {
  patient: fhir.Patient;
}

const PastMedications: React.FC<PastMedicationsProps> = ({ patient }) => {
  const { t } = useTranslation();
  const headerTitle = t('pastMedicationsHeaderTitle', 'Past medications');
  const displayText = t('pastMedicationsDisplayText', 'past medications');
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit(patient.id, 'order-basket');

  const { pastOrders, error, isLoading, isValidating } = usePatientOrders(patient?.id);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (pastOrders?.length) {
    return (
      <MedicationsDetailsTable
        isValidating={isValidating}
        title={t('pastMedicationsTableTitle', 'Past Medications')}
        medications={pastOrders}
        showDiscontinueButton={false}
        showModifyButton={false}
        showRenewButton={true}
        patient={patient}
      />
    );
  }

  return (
    <EmptyState
      displayText={displayText}
      headerTitle={headerTitle}
      launchForm={() => launchOrderBasket({}, { encounterUuid: '' })}
    />
  );
};

export default PastMedications;
