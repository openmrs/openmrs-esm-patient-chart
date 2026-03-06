import React, { useMemo } from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import {
  type OrderBasketExtensionProps,
  type OrderBasketItem,
  type ExportedOrderBasketWindowProps,
} from '@openmrs/esm-patient-common-lib';
import OrderBasket from './order-basket.component';

/**
 * This workspace renders the main order basket, which contains the buttons to add a drug order and to add a lab order.
 *
 * This workspace is meant for use outside the the patient chart
 */
const ExportedOrderBasketWorkspace: React.FC<Workspace2DefinitionProps<{}, ExportedOrderBasketWindowProps, {}>> = ({
  windowProps: {
    patientUuid,
    patient,
    visitContext,
    mutateVisitContext,
    drugOrderWorkspaceName,
    labOrderWorkspaceName,
    generalOrderWorkspaceName,
    onOrderBasketSubmitted,
    visibleOrderPanels,
  },
  closeWorkspace,
  launchChildWorkspace,
}) => {
  const orderBasketExtensionProps = useMemo(() => {
    const launchDrugOrderForm = (order: OrderBasketItem) => {
      launchChildWorkspace(drugOrderWorkspaceName, { order });
    };
    const launchLabOrderForm = (orderTypeUuid: string, order: OrderBasketItem) => {
      launchChildWorkspace(labOrderWorkspaceName, { orderTypeUuid, order });
    };
    const launchGeneralOrderForm = (orderTypeUuid: string, order: OrderBasketItem) => {
      launchChildWorkspace(generalOrderWorkspaceName, { orderTypeUuid, order });
    };

    return {
      patient,
      launchDrugOrderForm,
      launchLabOrderForm,
      launchGeneralOrderForm,
      visibleOrderPanels,
    } satisfies OrderBasketExtensionProps;
  }, [
    launchChildWorkspace,
    drugOrderWorkspaceName,
    labOrderWorkspaceName,
    generalOrderWorkspaceName,
    patient,
    visibleOrderPanels,
  ]);

  return (
    <OrderBasket
      patientUuid={patientUuid}
      patient={patient}
      visitContext={visitContext}
      mutateVisitContext={mutateVisitContext}
      closeWorkspace={closeWorkspace}
      orderBasketExtensionProps={orderBasketExtensionProps}
      showPatientBanner
      onOrderBasketSubmitted={onOrderBasketSubmitted}
    />
  );
};

export default ExportedOrderBasketWorkspace;
