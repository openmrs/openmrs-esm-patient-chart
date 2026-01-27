import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { usePatientOrders } from '../api';

interface FutureMedicationsProps {
  patient: fhir.Patient;
}

const FutureMedications: React.FC<FutureMedicationsProps> = ({ patient }) => {
  const { t } = useTranslation();
  const headerTitle = t('futureMedicationsHeaderTitle', 'Future medications');
  const displayText = t('futureMedicationsDisplayText', 'future medications');

  const { futureOrders, error, isLoading, isValidating } = usePatientOrders(patient?.id);
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit(patient.id, 'order-basket');

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (futureOrders?.length) {
    return (
      <MedicationsDetailsTable
        isValidating={isValidating}
        title={t('futureMedicationsTableTitle', 'Future Medications')}
        medications={futureOrders}
        showDiscontinueButton={true}
        showModifyButton={true}
        showReorderButton={false}
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

export default FutureMedications;
