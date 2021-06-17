import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientOrders } from '../utils/use-current-patient-orders.hook';
import styles from './active-medications.component.scss';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { Provider } from 'unistore/react';
import { orderBasketStore } from './order-basket-store';
import Add16 from '@carbon/icons-react/es/add/16';
import Button from 'carbon-components-react/es/components/Button';
import { attach } from '@openmrs/esm-framework';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';

interface ActiveMedicationsProps {
  patientUuid: string;
  showAddMedications: boolean;
}

const ActiveMedications: React.FC<ActiveMedicationsProps> = ({ patientUuid, showAddMedications }) => {
  const { t } = useTranslation();
  const [activePatientOrders] = usePatientOrders(patientUuid, 'ACTIVE');

  const launchOrderBasket = () => attach('patient-chart-workspace-slot', 'order-basket-workspace');

  return (
    <Provider store={orderBasketStore}>
      {activePatientOrders ? (
        <div className={styles.activeMedicationContainer}>
          <div className={styles.activeMedicationHeader}>
            <h4 className={styles.title}>{t('activeMedications', 'Active Medications')}</h4>
            {showAddMedications && (
              <Button kind="ghost" renderIcon={Add16} iconDescription="Add notes" onClick={launchOrderBasket}>
                {t('add', 'Add')}
              </Button>
            )}
          </div>

          <MedicationsDetailsTable
            medications={activePatientOrders}
            showDiscontinueButton={true}
            showModifyButton={true}
            showReorderButton={false}
            showAddNewButton={false}
          />
        </div>
      ) : (
        <DataTableSkeleton />
      )}
    </Provider>
  );
};

export default ActiveMedications;
