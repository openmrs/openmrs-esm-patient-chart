import React, { useMemo } from 'react';
import { parseDate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState, ErrorState, Order } from '@openmrs/esm-patient-common-lib';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib/src/useLaunchWorkspaceRequiringVisit';
import OrderDetailsTable from '../components/orders-details-table.component';
import { usePatientOrders } from '../api/api';

export interface LabOrdersSummaryProps {
  patientUuid: string;
}

export default function LabOrdersSummary({ patientUuid }: LabOrdersSummaryProps) {
  const { t } = useTranslation();

  // const launchLabOrdersWorkspace = useLaunchWorkspaceRequiringVisit<LabOrderWorkspaceAdditionalProps>('lab-order');

  const {
    data: allOrders,
    error: error,
    isLoading: isLoading,
    isValidating: isValidating,
  } = usePatientOrders(patientUuid, 'ACTIVE');

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

  const pendingOrderHeaders = [
    {
      key: 'orderId',
      header: t('orderId', 'Order ID'),
      isSortable: true,
    },
    {
      key: 'dateOfOrder',
      header: t('dateOfOrder', 'Date of Order'),
      isSortable: true,
    },
    {
      key: 'orderType',
      header: t('orderType', 'Order Type'),
      isSortable: true,
    },
    {
      key: 'order',
      header: t('order', 'Order'),
      isSortable: true,
    },
    {
      key: 'priority',
      header: t('priority', 'Priority'),
      isSortable: true,
    },
    {
      key: 'orderedBy',
      header: t('orderedBy', 'Ordered By'),
      isSortable: true,
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
      isSortable: false,
    },
  ];

  const completedOrderHeaders = [
    {
      key: 'orderId',
      header: t('orderId', 'Order ID'),
      isSortable: true,
    },
    {
      key: 'dateOfOrder',
      header: t('dateOfOrder', 'Date of Order'),
      isSortable: true,
    },
    {
      key: 'orderType',
      header: t('orderType', 'Order Type'),
      isSortable: true,
    },
  ];

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        {(() => {
          const pendingOrdersHeaderTitle = t('pendingOrders', 'Pending orders');
          const pendingOrdersDisplayText = t('pendingOrdersTitle', 'pending orders');

          if (isLoading) return <DataTableSkeleton role="progressbar" />;

          if (error) return <ErrorState error={error} headerTitle={pendingOrdersHeaderTitle} />;

          if (activeOrders?.length) {
            return (
              <OrderDetailsTable
                tableHeaders={pendingOrderHeaders}
                isValidating={isValidating}
                title={pendingOrdersHeaderTitle}
                orderItems={activeOrders}
                patientUuid={patientUuid}
                showCancelButton={true}
                showViewEditButton={true}
                showAddResultsButton={true}
                showPrintButton={false}
              />
            );
          }

          return (
            <EmptyState
              displayText={pendingOrdersDisplayText}
              headerTitle={pendingOrdersHeaderTitle}
              // launchForm={launchLabOrdersWorkspace}
            />
          );
        })()}
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        {(() => {
          const completedDisplayText = t('completedOrders', 'Completed orders');
          const completedHeaderTitle = t('completedOrdersTitle', 'completed orders');

          if (isLoading) return <DataTableSkeleton role="progressbar" />;

          if (error) return <ErrorState error={error} headerTitle={completedHeaderTitle} />;

          if (pastOrders?.length) {
            return (
              <OrderDetailsTable
                tableHeaders={completedOrderHeaders}
                isValidating={isValidating}
                title={completedDisplayText}
                orderItems={pastOrders}
                patientUuid={patientUuid}
                showPrintButton={true}
              />
            );
          }

          return <EmptyState displayText={completedDisplayText} headerTitle={completedHeaderTitle} />;
        })()}
      </div>
    </>
  );
}
