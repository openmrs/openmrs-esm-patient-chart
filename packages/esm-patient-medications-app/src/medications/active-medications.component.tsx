import React from 'react';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import styles from './active-medications.scss';
import { useTranslation } from 'react-i18next';
import { usePatientOrders } from '../utils/use-current-patient-orders.hook';
import { Provider } from 'unistore/react';
import { orderBasketStore } from './order-basket-store';
import { DataTableSkeleton } from 'carbon-components-react';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

interface ActiveMedicationsProps {
  patientUuid: string;
  showAddMedications: boolean;
}

const ActiveMedications: React.FC<ActiveMedicationsProps> = ({ patientUuid, showAddMedications }) => {
  const { t } = useTranslation();
  const [activePatientOrders] = usePatientOrders(patientUuid, 'ACTIVE');

  return (
    <Provider store={orderBasketStore}>
      {(() => {
        if (activePatientOrders && !activePatientOrders?.length)
          return (
            <EmptyState
              displayText={t('activeMedications', 'Active medications')}
              headerTitle={t('activeMedications', 'active medications')}
            />
          );
        if (activePatientOrders?.length) {
          return (
            <div className={styles.activeMedicationContainer}>
              <MedicationsDetailsTable
                title={t('activeMedications', 'Active Medications')}
                medications={activePatientOrders}
                showDiscontinueButton={true}
                showModifyButton={true}
                showReorderButton={false}
                showAddNewButton={false}
              />
            </div>
          );
        }
        return <DataTableSkeleton role="progressbar" />;
      })()}
    </Provider>
  );
};

export default ActiveMedications;
