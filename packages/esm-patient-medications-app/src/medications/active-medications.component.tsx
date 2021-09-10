import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientOrders } from '../utils/use-current-patient-orders.hook';
import styles from './active-medications.scss';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { Provider } from 'unistore/react';
import { orderBasketStore } from './order-basket-store';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';

interface ActiveMedicationsProps {
  patientUuid: string;
  showAddMedications: boolean;
}

const ActiveMedications: React.FC<ActiveMedicationsProps> = ({ patientUuid, showAddMedications }) => {
  const { t } = useTranslation();
  const [activePatientOrders] = usePatientOrders(patientUuid, 'ACTIVE');

  return (
    <Provider store={orderBasketStore}>
      {activePatientOrders ? (
        <div className={styles.activeMedicationContainer}>
          <MedicationsDetailsTable
            title={t('activeMedications', 'Active Medications')}
            medications={activePatientOrders}
            showDiscontinueButton={true}
            showModifyButton={true}
            showReorderButton={false}
            showAddNewButton={true}
          />
        </div>
      ) : (
        <DataTableSkeleton role="progressbar" />
      )}
    </Provider>
  );
};

export default ActiveMedications;
