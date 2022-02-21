import React from 'react';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { useTranslation } from 'react-i18next';
import { Provider } from 'unistore/react';
import { orderBasketStore } from './order-basket-store';
import { DataTableSkeleton } from 'carbon-components-react';
import { EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { usePatientOrders } from '../api/api';

interface ActiveMedicationsProps {
  patientUuid: string;
  showAddMedications: boolean;
}

const ActiveMedications: React.FC<ActiveMedicationsProps> = ({ patientUuid, showAddMedications }) => {
  const { t } = useTranslation();
  const displayText = t('activeMedications', 'Active medications');
  const headerTitle = t('activeMedications', 'active medications');

  const { data: activePatientOrders, isError, isLoading, isValidating } = usePatientOrders(patientUuid, 'ACTIVE');

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
          title={t('activeMedications', 'Active Medications')}
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
