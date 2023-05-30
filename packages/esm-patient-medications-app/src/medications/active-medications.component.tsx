import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { usePatientOrders } from '../api/api';
import { ConfigObject } from '../config-schema';
import { useLaunchOrderBasket } from '../utils/launchOrderBasket';

interface ActiveMedicationsProps {
  patientUuid: string;
  showAddMedications: boolean;
}

const ActiveMedications: React.FC<ActiveMedicationsProps> = ({ patientUuid, showAddMedications }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const displayText = t('activeMedicationsDisplayText', 'Active medications');
  const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');

  const { data: activePatientOrders, error, isLoading, isValidating } = usePatientOrders(patientUuid, 'ACTIVE');

  const { launchOrderBasket } = useLaunchOrderBasket(patientUuid);

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
        showAddNewButton={showAddMedications}
        patientUuid={patientUuid}
      />
    );
  }

  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchOrderBasket} />;
};

export default ActiveMedications;
