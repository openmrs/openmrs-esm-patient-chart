import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, type Order } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';

interface MedicationsDisplaySectionProps {
  displayText: string;
  error: Error | null;
  headerTitle: string;
  isLoading: boolean;
  isValidating: boolean;
  orders: Order[];
  patient: fhir.Patient;
  type: 'active' | 'past';
  launchAddDrugWorkspace?: () => void;
}

const MedicationsDisplaySection: React.FC<MedicationsDisplaySectionProps> = ({
  displayText,
  error,
  headerTitle,
  isLoading,
  isValidating,
  orders,
  patient,
  type,
  launchAddDrugWorkspace,
}) => {
  const { t } = useTranslation();
  const isActive = type === 'active';

  if (isLoading) return <DataTableSkeleton role="progressbar" />;

  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

  if (orders?.length) {
    return (
      <MedicationsDetailsTable
        isValidating={isValidating}
        medications={orders}
        patient={patient}
        showDiscontinueButton={isActive}
        showModifyButton={isActive}
        showReorderButton={!isActive}
        title={
          isActive
            ? t('activeMedicationsTableTitle', 'Active Medications')
            : t('pastMedicationsTableTitle', 'Past Medications')
        }
      />
    );
  }

  return (
    <EmptyState
      displayText={displayText}
      headerTitle={headerTitle}
      launchForm={isActive ? launchAddDrugWorkspace : undefined}
    />
  );
};

export default MedicationsDisplaySection;
