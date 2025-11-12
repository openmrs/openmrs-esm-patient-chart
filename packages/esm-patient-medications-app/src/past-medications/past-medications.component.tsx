import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { usePastPatientOrders } from '../api/api';

interface PastMedicationsProps {
  patient: fhir.Patient;
}

const PastMedications: React.FC<PastMedicationsProps> = ({ patient }) => {
  const { t } = useTranslation();
  const headerTitle = t('pastMedicationsHeaderTitle', 'Past medications');
  const displayText = t('pastMedicationsDisplayText', 'past medications');

  const { data: pastPatientOrders, error, isLoading, isValidating } = usePastPatientOrders(patient?.id);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (pastPatientOrders?.length) {
    return (
      <MedicationsDetailsTable
        isValidating={isValidating}
        title={t('pastMedicationsTableTitle', 'Past Medications')}
        medications={pastPatientOrders}
        showDiscontinueButton={false}
        showModifyButton={false}
        showReorderButton={true}
        patient={patient}
      />
    );
  }

  return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
};

export default PastMedications;
