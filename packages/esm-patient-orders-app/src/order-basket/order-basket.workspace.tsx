import React, { useMemo } from 'react';
import { type OrderBasketWindowProps, type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import OrderBasket from './order-basket.component';
import { createOrderBasketExtensionProps } from './order-basket.utils';

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
  const orderBasketExtensionProps = useMemo(
    () =>
      createOrderBasketExtensionProps({
        patient,
        drugOrderWorkspaceName: 'add-drug-order',
        labOrderWorkspaceName: 'add-lab-order',
        generalOrderWorkspaceName: 'orderable-concept-workspace',
        launchChildWorkspace,
      }),
    [launchChildWorkspace, patient],
  );

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
