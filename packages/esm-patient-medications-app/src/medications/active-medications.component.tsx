import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { Provider } from 'unistore/react';
import { useConfig } from '@openmrs/esm-framework';
import { EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { orderBasketStore } from './order-basket-store';
import { usePatientOrders } from '../api/api';
import { ConfigObject } from '../config-schema';

interface ActiveMedicationsProps {
  patientUuid: string;
  showAddMedications: boolean;
}

const ActiveMedications: React.FC<ActiveMedicationsProps> = ({ patientUuid, showAddMedications }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const displayText = t('activeMedicationsDisplayText', 'Active medications');
  const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');

  const {
    data: activePatientOrders,
    isError,
    isLoading,
    isValidating,
  } = usePatientOrders(patientUuid, 'ACTIVE', config.careSettingUuid);

  const launchOrderBasket = React.useCallback(() => {
    launchPatientWorkspace('order-basket-workspace');
  }, []);

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (activePatientOrders?.length) {
    return (
      <Provider store={orderBasketStore}>
        <MedicationsDetailsTable
          isValidating={isValidating}
          title={t('activeMedicationsTableTitle', 'Active Medications')}
          medications={activePatientOrders}
          showDiscontinueButton={true}
          showModifyButton={true}
          showReorderButton={false}
          showAddNewButton={showAddMedications}
        />
      </Provider>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchOrderBasket} />;
};

export default ActiveMedications;
