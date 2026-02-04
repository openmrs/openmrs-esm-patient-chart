import React, { useMemo } from 'react';
import {
  type OrderBasketExtensionProps,
  type OrderBasketWindowProps,
  type OrderBasketItem,
  type PatientWorkspace2DefinitionProps,
} from '@openmrs/esm-patient-common-lib';
import OrderBasket from './order-basket.component';

/**
 * This workspace renders the main order basket, which contains the buttons to add a drug order and to add a lab order.
 *
 * This workspace must only be used within the patient chart
 * @see exported-order-basket.workspace.tsx
 */
const OrderBasketWorkspace: React.FC<PatientWorkspace2DefinitionProps<{}, OrderBasketWindowProps>> = ({
  groupProps: { patientUuid, patient, visitContext, mutateVisitContext },
  closeWorkspace,
  launchChildWorkspace,
}) => {
  const orderBasketExtensionProps = useMemo(() => {
    const launchDrugOrderForm = (order: OrderBasketItem) => {
      launchChildWorkspace('add-drug-order', { order });
    };
    const launchLabOrderForm = (orderTypeUuid: string, order: OrderBasketItem) => {
      launchChildWorkspace('add-lab-order', { orderTypeUuid, order });
    };
    const launchGeneralOrderForm = (orderTypeUuid: string, order: OrderBasketItem) => {
      launchChildWorkspace('orderable-concept-workspace', { orderTypeUuid, order });
    };

    return {
      patient,
      launchDrugOrderForm,
      launchLabOrderForm,
      launchGeneralOrderForm,
    } satisfies OrderBasketExtensionProps;
  }, [launchChildWorkspace, patient]);

  return (
    <OrderBasket
      patientUuid={patientUuid}
      patient={patient}
      visitContext={visitContext}
      mutateVisitContext={mutateVisitContext}
      closeWorkspace={closeWorkspace}
      orderBasketExtensionProps={orderBasketExtensionProps}
    />
  );
};

export default OrderBasketWorkspace;
