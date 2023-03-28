import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { formatDatetime, parseDate, useConfig } from '@openmrs/esm-framework';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { usePatientOrders } from '../api/api';
import { ConfigObject } from '../config-schema';
import { useLaunchOrderBasket } from '../utils/launchOrderBasket';
import { Order } from '../types/order';

export interface MedicationsSummaryProps {
  patientUuid: string;
}

export default function MedicationsSummary({ patientUuid }: MedicationsSummaryProps) {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const { launchOrderBasket } = useLaunchOrderBasket(patientUuid);

  const {
    data: allOrders,
    error: error,
    isLoading: isLoading,
    isValidating: isValidating,
  } = usePatientOrders(patientUuid, 'any');

  const [pastOrders, activeOrders] = useMemo(() => {
    const currentDate = new Date();
    const pastOrders: Array<Order> = [];
    const activeOrders: Array<Order> = [];

    if (allOrders) {
      for (let i = 0; i < allOrders.length; i++) {
        const order = allOrders[i];
        if (order.autoExpireDate && parseDate(order.autoExpireDate) < currentDate) {
          pastOrders.push(order);
        } else if (order.dateStopped && parseDate(order.dateStopped) < currentDate) {
          pastOrders.push(order);
        } else {
          activeOrders.push(order);
        }
      }
    }

    return [pastOrders, activeOrders];
  }, [allOrders]);

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        {(() => {
          const displayText = t('activeMedicationsDisplayText', 'Active medications');
          const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');

          if (isLoading) return <DataTableSkeleton role="progressbar" />;

          if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

          if (activeOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidating}
                title={t('activeMedicationsTableTitle', 'Active Medications')}
                medications={activeOrders}
                showDiscontinueButton={true}
                showModifyButton={true}
                showReorderButton={false}
                showAddNewButton={true}
                patientUuid={patientUuid}
              />
            );
          }

          return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchOrderBasket} />;
        })()}
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        {(() => {
          const displayText = t('pastMedicationsDisplayText', 'Past medications');
          const headerTitle = t('pastMedicationsHeaderTitle', 'past medications');

          if (isLoading) return <DataTableSkeleton role="progressbar" />;

          if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

          if (pastOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidating}
                title={t('pastMedicationsTableTitle', 'Past Medications')}
                medications={pastOrders}
                showDiscontinueButton={true}
                showModifyButton={true}
                showReorderButton={true}
                showAddNewButton={true}
                patientUuid={patientUuid}
              />
            );
          }

          return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
        })()}
      </div>
    </>
  );
}
