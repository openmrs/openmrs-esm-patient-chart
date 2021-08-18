import React, { useEffect } from 'react';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import FloatingOrderBasketButton from './floating-order-basket-button.component';
import styles from './medications-summary.scss';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { useTranslation } from 'react-i18next';
import { usePatientOrders } from '../utils/use-current-patient-orders.hook';

export interface MedicationsSummaryProps {
  patientUuid: string;
}

export default function MedicationsSummary({ patientUuid }: MedicationsSummaryProps) {
  const { t } = useTranslation();
  const [activePatientOrders, fetchActivePatientOrders] = usePatientOrders(patientUuid, 'ACTIVE');
  const [pastPatientOrders] = usePatientOrders(patientUuid, 'any');
  useEffect(() => {
    fetchActivePatientOrders();
  });
  return (
    <>
      <h1 className={styles.productiveHeading03}>{t('medications', 'Medications')}</h1>
      {activePatientOrders ? (
        <MedicationsDetailsTable
          title={t('activeMedications', 'Active Medications')}
          medications={activePatientOrders}
          showDiscontinueButton={true}
          showModifyButton={true}
          showReorderButton={false}
          showAddNewButton={false}
        />
      ) : (
        <DataTableSkeleton />
      )}
      <div style={{ marginTop: '3rem' }}>
        {pastPatientOrders ? (
          <MedicationsDetailsTable
            title={t('pastMedications', 'Past Medications')}
            medications={pastPatientOrders}
            showDiscontinueButton={false}
            showModifyButton={false}
            showReorderButton={true}
            showAddNewButton={false}
          />
        ) : (
          <DataTableSkeleton />
        )}
      </div>
      <FloatingOrderBasketButton />
    </>
  );
}
